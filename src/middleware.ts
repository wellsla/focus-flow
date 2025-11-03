import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // NEVER apply middleware to Auth0 SDK routes
  if (pathname.startsWith("/auth/")) {
    return;
  }

  return auth0.middleware(req);
}

// Match all routes except static assets
// Auth0 routes are explicitly excluded in the middleware function above
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
