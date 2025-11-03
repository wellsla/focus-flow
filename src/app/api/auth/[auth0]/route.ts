export const runtime = "nodejs";

// Redirect App Router auth routes to Pages API routes to leverage the SDK there
export async function GET(
  request: Request,
  context: { params: { auth0: string } }
) {
  const url = new URL(request.url);
  const target = new URL(
    `/auth/${context.params.auth0}${url.search}`,
    url.origin
  );
  return Response.redirect(target, 307);
}

export const POST = GET;
