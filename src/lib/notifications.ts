import { readFileSync } from "node:fs";
import net from "node:net";
import tls from "node:tls";
import type { RowDataPacket } from "mysql2";
import { execute, query, queryOne } from "./db";
import { getEnv } from "./env";

const NOTICE_DAYS = new Set([90, 60, 30, 15, 10, 5]);
const DAY_MS = 24 * 60 * 60 * 1000;

interface MonitorRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  certification_type: string;
  issue_date: string;
  expires_at: string;
}

interface NotificationLogRow extends RowDataPacket {
  id: number;
}

interface SmtpResponse {
  code: number;
  message: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  from: string;
  user?: string;
  password?: string;
  rejectUnauthorized: boolean;
  ca?: Buffer;
}

export interface MonitorResult {
  checked: number;
  sent: number;
  skipped: number;
  failed: number;
  details: Array<{
    certificationId: number;
    email: string;
    notificationKey: string;
    status: "sent" | "skipped" | "failed";
    message: string;
  }>;
}

function dateOnlyUtc(value: string | Date) {
  const raw = value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
  const [year, month, day] = raw.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function notificationFor(expiresAt: string, currentIso: string) {
  const daysUntil = Math.round((dateOnlyUtc(expiresAt) - dateOnlyUtc(currentIso)) / DAY_MS);

  if (NOTICE_DAYS.has(daysUntil)) {
    return {
      key: `before-${daysUntil}`,
      subject: `Certification expires in ${daysUntil} days`,
      lead: `This certification expires in ${daysUntil} days.`
    };
  }

  if (daysUntil < 0) {
    return {
      key: `expired-${currentIso}`,
      subject: "Certification is expired",
      lead: "This certification is expired and needs action."
    };
  }

  return null;
}

function smtpConfig() {
  if (!getEnv("SMTP_HOST") || !getEnv("SMTP_FROM")) {
    return null;
  }

  const caFile = getEnv("SMTP_CA_FILE");

  return {
    host: getEnv("SMTP_HOST") ?? "",
    port: Number(getEnv("SMTP_PORT") ?? 587),
    secure: String(getEnv("SMTP_SECURE") ?? "false") === "true",
    from: getEnv("SMTP_FROM") ?? "",
    user: getEnv("SMTP_USER"),
    password: getEnv("SMTP_PASSWORD"),
    rejectUnauthorized:
      String(getEnv("SMTP_TLS_REJECT_UNAUTHORIZED") ?? "true").toLowerCase() !== "false",
    ca: caFile ? readFileSync(caFile) : undefined
  };
}

function sanitizeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function extractEmail(value: string) {
  const match = value.match(/<([^>]+)>/);
  return sanitizeHeader(match?.[1] ?? value).replace(/^mailto:/i, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function dotStuff(message: string) {
  return message
    .split(/\r?\n/)
    .map((line) => (line.startsWith(".") ? `.${line}` : line))
    .join("\r\n");
}

function createReader(socket: net.Socket | tls.TLSSocket) {
  let buffer = "";
  const lines: string[] = [];
  const waiters: Array<(line: string) => void> = [];
  const failures: Array<(error: Error) => void> = [];
  let error: Error | null = null;

  function flushError(nextError: Error) {
    error = nextError;
    while (failures.length > 0) {
      failures.shift()?.(nextError);
    }
  }

  socket.setEncoding("utf8");
  socket.on("data", (chunk) => {
    buffer += chunk;
    let index = buffer.indexOf("\n");
    while (index >= 0) {
      const line = buffer.slice(0, index).replace(/\r$/, "");
      buffer = buffer.slice(index + 1);
      const waiter = waiters.shift();
      failures.shift();
      if (waiter) {
        waiter(line);
      } else {
        lines.push(line);
      }
      index = buffer.indexOf("\n");
    }
  });
  socket.on("error", flushError);
  socket.on("timeout", () => flushError(new Error("SMTP connection timed out.")));
  socket.on("end", () => flushError(new Error("SMTP connection ended unexpectedly.")));

  return {
    nextLine() {
      if (error) {
        return Promise.reject(error);
      }

      const line = lines.shift();
      if (line) {
        return Promise.resolve(line);
      }

      return new Promise<string>((resolve, reject) => {
        waiters.push(resolve);
        failures.push(reject);
      });
    }
  };
}

async function readResponse(reader: ReturnType<typeof createReader>): Promise<SmtpResponse> {
  const lines: string[] = [];
  let code = 0;

  while (true) {
    const line = await reader.nextLine();
    lines.push(line);
    code = Number(line.slice(0, 3));

    if (/^\d{3} /.test(line)) {
      break;
    }
  }

  return {
    code,
    message: lines.join("\n")
  };
}

async function expectResponse(
  reader: ReturnType<typeof createReader>,
  allowed: number[]
) {
  const response = await readResponse(reader);
  if (!allowed.includes(response.code)) {
    throw new Error(`SMTP error ${response.code}: ${response.message}`);
  }

  return response;
}

function writeLine(socket: net.Socket | tls.TLSSocket, line: string) {
  socket.write(`${line}\r\n`);
}

function connectPlain(host: string, port: number) {
  return new Promise<net.Socket>((resolve, reject) => {
    const socket = net.connect({ host, port });
    socket.setTimeout(30000);
    socket.once("connect", () => resolve(socket));
    socket.once("error", reject);
    socket.once("timeout", () => reject(new Error("SMTP connection timed out.")));
  });
}

function tlsOptions(config: SmtpConfig): tls.ConnectionOptions {
  const options: tls.ConnectionOptions = {
    servername: config.host,
    rejectUnauthorized: config.rejectUnauthorized
  };

  if (config.ca) {
    options.ca = config.ca;
  }

  return options;
}

function connectSecure(config: SmtpConfig) {
  return new Promise<tls.TLSSocket>((resolve, reject) => {
    const socket = tls.connect({
      host: config.host,
      port: config.port,
      ...tlsOptions(config)
    });
    socket.setTimeout(30000);
    socket.once("secureConnect", () => resolve(socket));
    socket.once("error", reject);
    socket.once("timeout", () => reject(new Error("SMTP connection timed out.")));
  });
}

function upgradeToTls(socket: net.Socket, config: SmtpConfig) {
  return new Promise<tls.TLSSocket>((resolve, reject) => {
    socket.removeAllListeners("data");
    const secureSocket = tls.connect({
      socket,
      ...tlsOptions(config)
    });
    secureSocket.setTimeout(30000);
    secureSocket.once("secureConnect", () => resolve(secureSocket));
    secureSocket.once("error", reject);
    secureSocket.once("timeout", () => reject(new Error("SMTP connection timed out.")));
  });
}

async function sendSmtpMail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const config = smtpConfig();
  if (!config) {
    return {
      sent: false,
      message: "SMTP_HOST and SMTP_FROM are required to send notification email."
    };
  }

  let socket: net.Socket | tls.TLSSocket = config.secure
    ? await connectSecure(config)
    : await connectPlain(config.host, config.port);
  let reader = createReader(socket);

  try {
    await expectResponse(reader, [220]);
    writeLine(socket, "EHLO certification-tracker.local");
    const ehlo = await expectResponse(reader, [250]);

    if (!config.secure && ehlo.message.toUpperCase().includes("STARTTLS")) {
      writeLine(socket, "STARTTLS");
      await expectResponse(reader, [220]);
      socket = await upgradeToTls(socket as net.Socket, config);
      reader = createReader(socket);
      writeLine(socket, "EHLO certification-tracker.local");
      await expectResponse(reader, [250]);
    }

    if (config.user && config.password) {
      const auth = Buffer.from(`\0${config.user}\0${config.password}`).toString("base64");
      writeLine(socket, `AUTH PLAIN ${auth}`);
      await expectResponse(reader, [235, 503]);
    }

    writeLine(socket, `MAIL FROM:<${extractEmail(config.from)}>`);
    await expectResponse(reader, [250]);
    writeLine(socket, `RCPT TO:<${extractEmail(input.to)}>`);
    await expectResponse(reader, [250, 251]);
    writeLine(socket, "DATA");
    await expectResponse(reader, [354]);

    const boundary = `cert-tracker-${Date.now()}`;
    const message = [
      `From: ${sanitizeHeader(config.from)}`,
      `To: ${sanitizeHeader(input.to)}`,
      `Subject: ${sanitizeHeader(input.subject)}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      input.text,
      "",
      `--${boundary}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      input.html,
      "",
      `--${boundary}--`
    ].join("\r\n");

    socket.write(`${dotStuff(message)}\r\n.\r\n`);
    await expectResponse(reader, [250]);
    writeLine(socket, "QUIT");
    await expectResponse(reader, [221]);
  } finally {
    socket.end();
  }

  return {
    sent: true,
    message: "Email sent."
  };
}

async function alreadySent(certificationId: number, notificationKey: string) {
  const row = await queryOne<NotificationLogRow>(
    `SELECT id
     FROM notification_log
     WHERE certification_id = ? AND notification_key = ?
     LIMIT 1`,
    [certificationId, notificationKey]
  );

  return Boolean(row);
}

async function recordSent(certificationId: number, notificationKey: string, sentTo: string) {
  await execute(
    `INSERT INTO notification_log (certification_id, notification_key, sent_to)
     VALUES (?, ?, ?)`,
    [certificationId, notificationKey, sentTo]
  );
}

async function sendEmail(row: MonitorRow, notice: { subject: string; lead: string }) {
  const appUrl = getEnv("APP_URL") ?? "http://localhost:4321";
  const issueDate = String(row.issue_date).slice(0, 10);
  const expireDate = String(row.expires_at).slice(0, 10);
  const text = [
    notice.lead,
    "",
    `Name: ${row.full_name}`,
    `Certification: ${row.certification_type}`,
    `Issue date: ${issueDate}`,
    `Expire date: ${expireDate}`,
    "",
    `Open the tracker: ${appUrl}/dashboard`
  ].join("\n");

  return sendSmtpMail({
    to: row.email,
    subject: notice.subject,
    text,
    html: `<p>${escapeHtml(notice.lead)}</p>
      <table cellpadding="6" cellspacing="0" border="0">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(row.full_name)}</td></tr>
        <tr><td><strong>Certification</strong></td><td>${escapeHtml(row.certification_type)}</td></tr>
        <tr><td><strong>Issue date</strong></td><td>${escapeHtml(issueDate)}</td></tr>
        <tr><td><strong>Expire date</strong></td><td>${escapeHtml(expireDate)}</td></tr>
      </table>
      <p><a href="${escapeHtml(appUrl)}/dashboard">Open the tracker</a></p>`
  });
}

export async function runCertificationMonitor(currentIso = todayIso()): Promise<MonitorResult> {
  const rows = await query<MonitorRow>(
    `SELECT c.id, c.full_name, c.email, c.phone,
            t.name AS certification_type,
            c.issue_date, c.expires_at
     FROM certifications c
     INNER JOIN certification_types t ON t.id = c.certification_type_id
     WHERE c.status = 'active'
       AND c.status <> 'removed'
     ORDER BY c.expires_at ASC`
  );

  const result: MonitorResult = {
    checked: rows.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    details: []
  };

  for (const row of rows) {
    const notice = notificationFor(String(row.expires_at).slice(0, 10), currentIso);
    if (!notice) {
      continue;
    }

    const wasSent = await alreadySent(Number(row.id), notice.key);
    if (wasSent) {
      result.skipped += 1;
      result.details.push({
        certificationId: Number(row.id),
        email: row.email,
        notificationKey: notice.key,
        status: "skipped",
        message: "Notification already sent."
      });
      continue;
    }

    try {
      const emailResult = await sendEmail(row, notice);
      if (!emailResult.sent) {
        result.failed += 1;
        result.details.push({
          certificationId: Number(row.id),
          email: row.email,
          notificationKey: notice.key,
          status: "failed",
          message: emailResult.message
        });
        continue;
      }

      await recordSent(Number(row.id), notice.key, row.email);
      result.sent += 1;
      result.details.push({
        certificationId: Number(row.id),
        email: row.email,
        notificationKey: notice.key,
        status: "sent",
        message: "Notification sent."
      });
    } catch (error) {
      result.failed += 1;
      result.details.push({
        certificationId: Number(row.id),
        email: row.email,
        notificationKey: notice.key,
        status: "failed",
        message: error instanceof Error ? error.message : "Unknown email error."
      });
    }
  }

  return result;
}
