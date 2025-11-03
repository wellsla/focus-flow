import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(req: NextRequest) {
  return auth0.middleware(req);
}

// Protect app sections but explicitly exclude /auth/*, _next/*, and assets
// This allows Auth0 SDK to handle /auth/login, /auth/callback, /auth/profile, etc.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth/).*)",
  ],
};
