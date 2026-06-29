import type { APIRoute } from "astro";
import { certificationSchema } from "../../../lib/validation";
import {
  createCertification,
  listCertifications
} from "../../../lib/certifications";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const certifications = await listCertifications(locals.user);
  return Response.json({ certifications });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = certificationSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Enter valid certification details." }, { status: 400 });
  }

  const certification = await createCertification(locals.user, parsed.data);
  return Response.json({ certification }, { status: 201 });
};
