import { b as createUser, c as createSession } from '../../../chunks/auth_IzzbUe5i.mjs';
import { r as registerSchema } from '../../../chunks/validation_Q7fesEys.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request, cookies }) => {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Enter valid account details." }, { status: 400 });
  }
  try {
    const user = await createUser(parsed.data);
    await createSession(cookies, user.id);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
