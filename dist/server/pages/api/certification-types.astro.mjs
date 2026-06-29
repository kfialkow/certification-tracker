import { l as listCertificationTypes, c as createCertificationType } from '../../chunks/certifications_BUuMJGSl.mjs';
import { c as certificationTypeSchema } from '../../chunks/validation_Q7fesEys.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
function requireAdmin(user) {
  return user?.role === "admin";
}
const GET = async ({ locals }) => {
  if (!locals.user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }
  const types = await listCertificationTypes(!requireAdmin(locals.user));
  return Response.json({ types });
};
const POST = async ({ request, locals }) => {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
