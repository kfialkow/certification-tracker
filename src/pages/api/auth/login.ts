import type { APIRoute } from "astro";
import { authenticate, createSession } from "../../../lib/auth";
import { loginSchema } from "../../../lib/validation";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
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
