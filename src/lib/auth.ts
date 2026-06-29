import type { AstroCookies } from "astro";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { execute, queryOne, toMysqlDateTime } from "./db";
import { normalizeOptional } from "./validation";

export const SESSION_COOKIE = "cert_tracker_session";

export type Role = "user" | "admin";

export interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
}

interface UserRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: Role;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function mapUser(row: UserRow): SessionUser {
  return {
    id: Number(row.id),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function countUsers() {
  const row = await queryOne<RowDataPacket & { total: number }>(
    "SELECT COUNT(*) AS total FROM users"
  );
  return Number(row?.total ?? 0);
}

export async function findUserByEmail(email: string) {
  return queryOne<UserRow>(
    "SELECT id, full_name, email, phone, password_hash, role FROM users WHERE email = ? LIMIT 1",
    [email.toLowerCase()]
  );
}

export async function createUser(input: {
  fullName: string;
  email: string;
  phone?: string | null;
  password: string;
}) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error("An account already exists for this email.");
  }

  const userCount = await countUsers();
  const role: Role = userCount === 0 ? "admin" : "user";
  const passwordHash = await hashPassword(input.password);
  const [result] = await execute<ResultSetHeader>(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [
      input.fullName,
      input.email.toLowerCase(),
      normalizeOptional(input.phone),
      passwordHash,
      role
    ]
  );

  return {
    id: Number(result.insertId),
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    phone: normalizeOptional(input.phone),
    role
  };
}

export async function createSession(cookies: AstroCookies, userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  await execute(
    `INSERT INTO user_sessions (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, hashToken(token), toMysqlDateTime(expiresAt)]
  );

  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function getSessionUser(cookies: AstroCookies) {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const row = await queryOne<UserRow>(
    `SELECT u.id, u.full_name, u.email, u.phone, u.password_hash, u.role
     FROM user_sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > NOW()
     LIMIT 1`,
    [hashToken(token)]
  );

  return row ? mapUser(row) : null;
}

export async function destroySession(cookies: AstroCookies) {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await execute("DELETE FROM user_sessions WHERE token_hash = ?", [
      hashToken(token)
    ]);
  }

  cookies.delete(SESSION_COOKIE, {
    path: "/"
  });
}

export async function authenticate(email: string, password: string) {
  const row = await findUserByEmail(email);
  if (!row) {
    return null;
  }

  const valid = await verifyPassword(password, row.password_hash);
  return valid ? mapUser(row) : null;
}
