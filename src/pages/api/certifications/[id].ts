import type { APIRoute } from "astro";
import {
  markCertificationRemoved,
  updateCertification
} from "../../../lib/certifications";
import { certificationSchema } from "../../../lib/validation";

export const prerender = false;

function parseId(value: string | undefined) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const id = parseId(params.id);
  if (!id) {
    return Response.json({ error: "Invalid certification id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = certificationSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Enter valid certification details." }, { status: 400 });
  }

  const certification = await updateCertification(locals.user, id, parsed.data);
  if (!certification) {
    return Response.json({ error: "Certification not found." }, { status: 404 });
  }

  return Response.json({ certification });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const id = parseId(params.id);
  if (!id) {
    return Response.json({ error: "Invalid certification id." }, { status: 400 });
  }

  await markCertificationRemoved(locals.user, id);
  return Response.json({ ok: true });
};
