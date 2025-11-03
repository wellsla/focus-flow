// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // For Auth0 SDK routes, let the SDK handle them
  if (pathname.startsWith("/auth/")) {
    return auth0.middleware(req);
  }

  // For protected app routes, check authentication
  const res = await auth0.middleware(req);

  // If not authenticated, Auth0 will redirect to /auth/login
  // If authenticated, continue to the requested page
  return res;
}

export const config = {
  matcher: [
    // Auth0 routes
    "/auth/login",
    "/auth/logout",
    "/auth/callback",
    "/auth/profile",
    "/auth/access-token",
    // Protected app routes
    "/home/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/applications/:path*",
    "/finances/:path*",
    "/goals/:path*",
    "/routine/:path*",
    "/roadmap/:path*",
    "/performance/:path*",
    "/time-management/:path*",
  ],
};
