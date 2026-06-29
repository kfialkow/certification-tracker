import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'node:crypto';
import { e as execute, t as toMysqlDateTime, a as queryOne } from './db_zUMSOw2s.mjs';
import { n as normalizeOptional } from './validation_Q7fesEys.mjs';

const SESSION_COOKIE = "cert_tracker_session";
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
function mapUser(row) {
  return {
    id: Number(row.id),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role
  };
}
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}
async function countUsers() {
  const row = await queryOne(
    "SELECT COUNT(*) AS total FROM users"
  );
  return Number(row?.total ?? 0);
}
async function findUserByEmail(email) {
  return queryOne(
    "SELECT id, full_name, email, phone, password_hash, role FROM users WHERE email = ? LIMIT 1",
    [email.toLowerCase()]
  );
}
async function createUser(input) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error("An account already exists for this email.");
  }
  const userCount = await countUsers();
  const role = userCount === 0 ? "admin" : "user";
  const passwordHash = await hashPassword(input.password);
  const [result] = await execute(
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
async function createSession(cookies, userId) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1e3 * 60 * 60 * 24 * 14);
  await execute(
    `INSERT INTO user_sessions (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, hashToken(token), toMysqlDateTime(expiresAt)]
  );
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}
async function getSessionUser(cookies) {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const row = await queryOne(
    `SELECT u.id, u.full_name, u.email, u.phone, u.password_hash, u.role
     FROM user_sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > NOW()
     LIMIT 1`,
    [hashToken(token)]
  );
  return row ? mapUser(row) : null;
}
async function destroySession(cookies) {
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
async function authenticate(email, password) {
  const row = await findUserByEmail(email);
  if (!row) {
    return null;
  }
  const valid = await verifyPassword(password, row.password_hash);
  return valid ? mapUser(row) : null;
}

export { authenticate as a, createUser as b, createSession as c, destroySession as d, getSessionUser as g };
