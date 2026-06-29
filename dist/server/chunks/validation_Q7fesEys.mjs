import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email().max(190),
  password: z.string().min(8).max(200)
});
const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(190),
  phone: z.string().trim().max(40).optional().nullable(),
  password: z.string().min(8).max(200)
});
const statusSchema = z.enum(["active", "renewed", "canceled", "removed"]);
const certificationSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(190),
  phone: z.string().trim().max(40).optional().nullable(),
  certificationTypeId: z.coerce.number().int().positive(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: statusSchema.default("active"),
  documentUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
  notes: z.string().trim().max(3e3).optional().nullable()
});
const certificationTypeSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3e3).optional().nullable(),
  isActive: z.coerce.boolean().default(true)
});
function normalizeOptional(value) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export { certificationSchema as a, certificationTypeSchema as c, loginSchema as l, normalizeOptional as n, registerSchema as r };
