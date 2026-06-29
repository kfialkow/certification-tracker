import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import { getEnv, requiredEnv } from "./env";

let pool: Pool | undefined;

const TRANSIENT_DB_ERRORS = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
  "PROTOCOL_CONNECTION_LOST",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"
]);

function isTransientDbError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";

  return (
    TRANSIENT_DB_ERRORS.has(code) ||
    message.includes("ECONNRESET") ||
    message.includes("Connection lost")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resetPool() {
  const stalePool = pool;
  pool = undefined;

  if (stalePool) {
    await stalePool.end().catch(() => undefined);
  }
}

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: getEnv("DB_HOST") ?? "127.0.0.1",
      port: Number(getEnv("DB_PORT") ?? 3306),
      user: requiredEnv("DB_USER"),
      password: requiredEnv("DB_PASSWORD"),
      database: requiredEnv("DB_NAME"),
      waitForConnections: true,
      connectionLimit: Number(getEnv("DB_CONNECTION_LIMIT") ?? 10),
      connectTimeout: Number(getEnv("DB_CONNECT_TIMEOUT") ?? 30000),
      idleTimeout: Number(getEnv("DB_IDLE_TIMEOUT") ?? 60000),
      enableKeepAlive: true,
      dateStrings: true,
      namedPlaceholders: false
    });
  }

  return pool;
}

export async function execute<T = any>(sql: string, params: any[] = []) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return (await getPool().execute(sql, params)) as [T, any[]];
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

export async function query<T extends RowDataPacket>(
  sql: string,
  params: any[] = []
) {
  const [rows] = await execute<T[]>(sql, params);
  return rows;
}

export async function queryOne<T extends RowDataPacket>(
  sql: string,
  params: any[] = []
) {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export function toMysqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}
