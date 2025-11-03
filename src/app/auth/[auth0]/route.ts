export const runtime = "nodejs";

// Important: Auth0 v4 SDK owns all /auth/* routes via middleware. This route is
// a no-op to avoid conflicts and type errors. If it ever runs, return 404 so
// that we don't accidentally loop by redirecting to the same path.
export async function GET() {
  return new Response("Not Found", { status: 404 });
}

export const POST = GET;
