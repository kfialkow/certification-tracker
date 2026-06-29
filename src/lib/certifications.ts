import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { execute, query, queryOne } from "./db";
import type { SessionUser } from "./auth";
import type { z } from "zod";
import {
  certificationSchema,
  certificationTypeSchema,
  normalizeOptional
} from "./validation";

export type CertificationInput = z.infer<typeof certificationSchema>;
export type CertificationTypeInput = z.infer<typeof certificationTypeSchema>;

export interface CertificationType {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface Certification {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string | null;
  certificationTypeId: number;
  certificationType: string;
  issueDate: string;
  expiresAt: string;
  status: "active" | "renewed" | "canceled" | "removed";
  documentUrl: string | null;
  notes: string | null;
}

interface CertificationTypeRow extends RowDataPacket {
  id: number;
  name: string;
  description: string | null;
  is_active: 0 | 1;
}

interface CertificationRow extends RowDataPacket {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  certification_type_id: number;
  certification_type: string;
  issue_date: string;
  expires_at: string;
  status: Certification["status"];
  document_url: string | null;
  notes: string | null;
}

function mapType(row: CertificationTypeRow): CertificationType {
  return {
    id: Number(row.id),
    name: row.name,
    description: row.description,
    isActive: Boolean(row.is_active)
  };
}

function mapCertification(row: CertificationRow): Certification {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    certificationTypeId: Number(row.certification_type_id),
    certificationType: row.certification_type,
    issueDate: String(row.issue_date).slice(0, 10),
    expiresAt: String(row.expires_at).slice(0, 10),
    status: row.status,
    documentUrl: row.document_url,
    notes: row.notes
  };
}

export async function listCertificationTypes(activeOnly = false) {
  const rows = await query<CertificationTypeRow>(
    `SELECT id, name, description, is_active
     FROM certification_types
     ${activeOnly ? "WHERE is_active = 1" : ""}
     ORDER BY name ASC`
  );

  return rows.map(mapType);
}

export async function createCertificationType(input: CertificationTypeInput) {
  const [result] = await execute<ResultSetHeader>(
    `INSERT INTO certification_types (name, description, is_active)
     VALUES (?, ?, ?)`,
    [input.name, normalizeOptional(input.description), input.isActive ? 1 : 0]
  );

  return {
    id: Number(result.insertId),
    name: input.name,
    description: normalizeOptional(input.description),
    isActive: input.isActive
  };
}

export async function updateCertificationType(
  id: number,
  input: CertificationTypeInput
) {
  await execute(
    `UPDATE certification_types
     SET name = ?, description = ?, is_active = ?
     WHERE id = ?`,
    [
      input.name,
      normalizeOptional(input.description),
      input.isActive ? 1 : 0,
      id
    ]
  );

  return queryOne<CertificationTypeRow>(
    "SELECT id, name, description, is_active FROM certification_types WHERE id = ?",
    [id]
  ).then((row) => (row ? mapType(row) : null));
}

export async function listCertifications(user: SessionUser) {
  const rows = await query<CertificationRow>(
    `SELECT c.id, c.user_id, c.full_name, c.email, c.phone,
            c.certification_type_id, t.name AS certification_type,
            c.issue_date, c.expires_at, c.status, c.document_url, c.notes
     FROM certifications c
     INNER JOIN certification_types t ON t.id = c.certification_type_id
     WHERE c.status <> 'removed' AND c.user_id = ?
     ORDER BY c.expires_at ASC, c.full_name ASC`,
    [user.id]
  );

  return rows.map(mapCertification);
}

export async function createCertification(user: SessionUser, input: CertificationInput) {
  const [result] = await execute<ResultSetHeader>(
    `INSERT INTO certifications
       (user_id, full_name, email, phone, certification_type_id, issue_date,
        expires_at, status, document_url, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      input.fullName,
      input.email.toLowerCase(),
      normalizeOptional(input.phone),
      input.certificationTypeId,
      input.issueDate,
      input.expiresAt,
      input.status,
      normalizeOptional(input.documentUrl),
      normalizeOptional(input.notes)
    ]
  );

  return getCertificationForUser(user, Number(result.insertId));
}

export async function getCertificationForUser(user: SessionUser, id: number) {
  const rows = await query<CertificationRow>(
    `SELECT c.id, c.user_id, c.full_name, c.email, c.phone,
            c.certification_type_id, t.name AS certification_type,
            c.issue_date, c.expires_at, c.status, c.document_url, c.notes
     FROM certifications c
     INNER JOIN certification_types t ON t.id = c.certification_type_id
     WHERE c.id = ? AND c.user_id = ?
     LIMIT 1`,
    [id, user.id]
  );

  return rows[0] ? mapCertification(rows[0]) : null;
}

export async function updateCertification(
  user: SessionUser,
  id: number,
  input: CertificationInput
) {
  await execute(
    `UPDATE certifications
     SET full_name = ?, email = ?, phone = ?, certification_type_id = ?,
         issue_date = ?, expires_at = ?, status = ?, document_url = ?, notes = ?
     WHERE id = ? AND user_id = ?`,
    [
      input.fullName,
      input.email.toLowerCase(),
      normalizeOptional(input.phone),
      input.certificationTypeId,
      input.issueDate,
      input.expiresAt,
      input.status,
      normalizeOptional(input.documentUrl),
      normalizeOptional(input.notes),
      id,
      user.id
    ]
  );

  return getCertificationForUser(user, id);
}

export async function markCertificationRemoved(user: SessionUser, id: number) {
  await execute(
    "UPDATE certifications SET status = 'removed' WHERE id = ? AND user_id = ?",
    [id, user.id]
  );
}

export async function getAdminStats() {
  const users = await queryOne<RowDataPacket & { total: number }>(
    "SELECT COUNT(*) AS total FROM users"
  );
  const certifications = await queryOne<RowDataPacket & { total: number }>(
    "SELECT COUNT(*) AS total FROM certifications WHERE status <> 'removed'"
  );
  const expiring = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total
     FROM certifications
     WHERE status = 'active'
       AND expires_at BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)`
  );
  const types = await queryOne<RowDataPacket & { total: number }>(
    "SELECT COUNT(*) AS total FROM certification_types"
  );

  return {
    users: Number(users?.total ?? 0),
    certifications: Number(certifications?.total ?? 0),
    expiring: Number(expiring?.total ?? 0),
    types: Number(types?.total ?? 0)
  };
}
