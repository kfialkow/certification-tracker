import type { APIRoute } from "astro";
import { updateCertificationType } from "../../../lib/certifications";
import { certificationTypeSchema } from "../../../lib/validation";

export const prerender = false;

function parseId(value: string | undefined) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  if (locals.user?.role !== "admin") {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const id = parseId(params.id);
  if (!id) {
    return Response.json({ error: "Invalid certification type id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = certificationTypeSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Enter valid certification type details." }, { status: 400 });
  }

  const type = await updateCertificationType(id, parsed.data);
  if (!type) {
    return Response.json({ error: "Certification type not found." }, { status: 404 });
  }

  return Response.json({ type });
};
