import type { APIRoute } from "astro";
import { createSession, createUser } from "../../../lib/auth";
import { registerSchema } from "../../../lib/validation";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
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
