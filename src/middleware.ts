// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth0 SDK routes - ALWAYS let the SDK handle them, no checks needed
  if (pathname.startsWith("/auth/")) {
    return auth0.middleware(req);
  }

  // For protected app routes, check if user has a session
  try {
    const session = await auth0.getSession(req);

    if (!session || !session.user) {
      // No session - redirect to login with returnTo
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Has session - allow access
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth check failed:", error);
    // On error, redirect to login
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    // Auth0 routes
    "/auth/login",
    "/auth/logout",
    "/auth/callback",
    "/auth/profile",
    "/auth/access-token",
    // Protected app routes - ALL features require authentication
    "/home/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/applications/:path*",
    "/finances/:path*",
    "/goals/:path*",
    "/journal/:path*",
    "/performance/:path*",
    "/pomodoro/:path*",
    "/reminders/:path*",
    "/rewards/:path*",
    "/roadmap/:path*",
    "/routine/:path*",
    "/routines/:path*",
    "/tasks/:path*",
    "/time-management/:path*",
  ],
};
