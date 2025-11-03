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

// Only match protected routes under /(features) + exclude static assets and auth routes
export const config = {
  matcher: [
    /*
     * Match all authenticated app routes:
     * - /home, /dashboard, /profile, /settings, etc.
     *
     * Exclude:
     * - / (landing page - public)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public assets
     * - auth/* (Auth0 SDK routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|auth/|$).*)",
  ],
};
