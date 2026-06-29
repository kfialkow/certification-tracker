import { q as query, a as queryOne, e as execute } from './db_zUMSOw2s.mjs';
import { n as normalizeOptional } from './validation_Q7fesEys.mjs';

function mapType(row) {
  return {
    id: Number(row.id),
    name: row.name,
    description: row.description,
    isActive: Boolean(row.is_active)
  };
}
function mapCertification(row) {
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
async function listCertificationTypes(activeOnly = false) {
  const rows = await query(
    `SELECT id, name, description, is_active
     FROM certification_types
     ${activeOnly ? "WHERE is_active = 1" : ""}
     ORDER BY name ASC`
  );
  return rows.map(mapType);
}
async function createCertificationType(input) {
  const [result] = await execute(
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
async function updateCertificationType(id, input) {
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
  return queryOne(
    "SELECT id, name, description, is_active FROM certification_types WHERE id = ?",
    [id]
  ).then((row) => row ? mapType(row) : null);
}
async function listCertifications(user) {
  const rows = await query(
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
async function createCertification(user, input) {
  const [result] = await execute(
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
async function getCertificationForUser(user, id) {
  const rows = await query(
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
async function updateCertification(user, id, input) {
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
async function markCertificationRemoved(user, id) {
  await execute(
    "UPDATE certifications SET status = 'removed' WHERE id = ? AND user_id = ?",
    [id, user.id]
  );
}
async function getAdminStats() {
  const users = await queryOne(
    "SELECT COUNT(*) AS total FROM users"
  );
  const certifications = await queryOne(
    "SELECT COUNT(*) AS total FROM certifications WHERE status <> 'removed'"
  );
  const expiring = await queryOne(
    `SELECT COUNT(*) AS total
     FROM certifications
     WHERE status = 'active'
       AND expires_at BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)`
  );
  const types = await queryOne(
    "SELECT COUNT(*) AS total FROM certification_types"
  );
  return {
    users: Number(users?.total ?? 0),
    certifications: Number(certifications?.total ?? 0),
    expiring: Number(expiring?.total ?? 0),
    types: Number(types?.total ?? 0)
  };
}

export { updateCertification as a, listCertifications as b, createCertificationType as c, createCertification as d, getAdminStats as g, listCertificationTypes as l, markCertificationRemoved as m, updateCertificationType as u };
