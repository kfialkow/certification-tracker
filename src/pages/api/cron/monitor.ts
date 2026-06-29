import type { APIRoute } from "astro";
import { getEnv } from "../../../lib/env";
import { runCertificationMonitor } from "../../../lib/notifications";

export const prerender = false;

function isAuthorized(request: Request) {
  const expected = getEnv("CRON_SECRET");
  if (!expected) {
    return false;
  }

  const auth = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const urlSecret = new URL(request.url).searchParams.get("secret");

  return (
    auth === `Bearer ${expected}` ||
    headerSecret === expected ||
    urlSecret === expected
  );
}

async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Cron secret is missing or invalid." }, { status: 403 });
  }

  const result = await runCertificationMonitor();
  return Response.json(result);
}

export const GET: APIRoute = ({ request }) => handle(request);
export const POST: APIRoute = ({ request }) => handle(request);
