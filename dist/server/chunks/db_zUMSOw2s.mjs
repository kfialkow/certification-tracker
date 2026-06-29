import mysql from 'mysql2/promise';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let loaded = false;
function stripInlineComment(value) {
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if ((char === '"' || char === "'") && value[index - 1] !== "\\") {
      quote = quote === char ? null : char;
    }
    if (char === "#" && quote === null && /\s/.test(value[index - 1] ?? " ")) {
      return value.slice(0, index).trim();
    }
  }
  return value.trim();
}
function parseValue(raw) {
  let value = stripInlineComment(raw);
  if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
    value = value.slice(1, -1);
  }
  return value.replaceAll("\\n", "\n");
}
function loadLocalEnv() {
  if (loaded) {
    return;
  }
  loaded = true;
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) {
    return;
  }
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const index = trimmed.indexOf("=");
    if (index <= 0) {
      continue;
    }
    const key = trimmed.slice(0, index).trim();
    const value = parseValue(trimmed.slice(index + 1));
    process.env[key] ??= value;
  }
}
function getEnv(name) {
  loadLocalEnv();
  return process.env[name];
}
function requiredEnv(name) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

let pool;
const TRANSIENT_DB_ERRORS = /* @__PURE__ */ new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
  "PROTOCOL_CONNECTION_LOST",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"
]);
function isTransientDbError(error) {
  if (!error || typeof error !== "object") {
    return false;
  }
  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";
  return TRANSIENT_DB_ERRORS.has(code) || message.includes("ECONNRESET") || message.includes("Connection lost");
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function resetPool() {
  const stalePool = pool;
  pool = void 0;
  if (stalePool) {
    await stalePool.end().catch(() => void 0);
  }
}
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: getEnv("DB_HOST") ?? "127.0.0.1",
      port: Number(getEnv("DB_PORT") ?? 3306),
      user: requiredEnv("DB_USER"),
      password: requiredEnv("DB_PASSWORD"),
      database: requiredEnv("DB_NAME"),
      waitForConnections: true,
      connectionLimit: Number(getEnv("DB_CONNECTION_LIMIT") ?? 10),
      connectTimeout: Number(getEnv("DB_CONNECT_TIMEOUT") ?? 3e4),
      idleTimeout: Number(getEnv("DB_IDLE_TIMEOUT") ?? 6e4),
      enableKeepAlive: true,
      dateStrings: true,
      namedPlaceholders: false
    });
  }
  return pool;
}
async function execute(sql, params = []) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await getPool().execute(sql, params);
    } catch (error) {
      lastError = error;
      if (!isTransientDbError(error) || attempt === 2) {
        throw error;
      }
      if (attempt === 1) {
        await resetPool();
      }
      await sleep(250 * (attempt + 1));
    }
  }
  throw lastError;
}
async function query(sql, params = []) {
  const [rows] = await execute(sql, params);
  return rows;
}
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}
function toMysqlDateTime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export { queryOne as a, execute as e, getEnv as g, query as q, toMysqlDateTime as t };
