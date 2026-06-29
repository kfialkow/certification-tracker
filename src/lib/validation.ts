import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email().max(190),
  password: z.string().min(8).max(200)
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(190),
  phone: z.string().trim().max(40).optional().nullable(),
  password: z.string().min(8).max(200)
});

export const statusSchema = z.enum(["active", "renewed", "canceled", "removed"]);

export const certificationSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(190),
  phone: z.string().trim().max(40).optional().nullable(),
  certificationTypeId: z.coerce.number().int().positive(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: statusSchema.default("active"),
  documentUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
  notes: z.string().trim().max(3000).optional().nullable()
});

export const certificationTypeSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3000).optional().nullable(),
  isActive: z.coerce.boolean().default(true)
});

export function normalizeOptional(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
