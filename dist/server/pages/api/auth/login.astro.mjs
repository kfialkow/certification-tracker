import { a as authenticate, c as createSession } from '../../../chunks/auth_IzzbUe5i.mjs';
import { l as loginSchema } from '../../../chunks/validation_Q7fesEys.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request, cookies }) => {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Enter a valid email and password." }, { status: 400 });
  }
  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }
  await createSession(cookies, user.id);
  return Response.json({ user });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
