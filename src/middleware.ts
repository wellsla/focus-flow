import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth0 SDK routes should NEVER be processed by middleware
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // All routes under /(features) require authentication
  // Apply Auth0 middleware protection
  try {
    return await auth0.middleware(req);
  } catch (error) {
    console.error("Auth middleware error:", error);
    // On error, redirect to login
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

// CRITICAL: Only match feature routes, explicitly exclude everything else
// This prevents middleware from running on Auth0 SDK routes
export const config = {
  matcher: [
    // Only protect these specific feature routes
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
