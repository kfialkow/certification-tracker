import { m as markCertificationRemoved, a as updateCertification } from '../../../chunks/certifications_BUuMJGSl.mjs';
import { a as certificationSchema } from '../../../chunks/validation_Q7fesEys.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
const PATCH = async ({ params, request, locals }) => {
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
const DELETE = async ({ params, locals }) => {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PATCH,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
