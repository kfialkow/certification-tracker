import type { APIRoute } from "astro";
import {
  createCertificationType,
  listCertificationTypes
} from "../../../lib/certifications";
import { certificationTypeSchema } from "../../../lib/validation";

export const prerender = false;

function requireAdmin(user: App.Locals["user"]) {
  return user?.role === "admin";
}

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const types = await listCertificationTypes(!requireAdmin(locals.user));
  return Response.json({ types });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!requireAdmin(locals.user)) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = certificationTypeSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Enter valid certification type details." }, { status: 400 });
  }

  try {
    const type = await createCertificationType(parsed.data);
    return Response.json({ type }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create type." },
      { status: 400 }
    );
  }
};
