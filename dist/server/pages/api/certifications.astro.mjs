import { a as certificationSchema } from '../../chunks/validation_Q7fesEys.mjs';
import { b as listCertifications, d as createCertification } from '../../chunks/certifications_BUuMJGSl.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async ({ locals }) => {
  if (!locals.user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }
  const certifications = await listCertifications(locals.user);
  return Response.json({ certifications });
};
const POST = async ({ request, locals }) => {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
