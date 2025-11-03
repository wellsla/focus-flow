import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "../lib/auth0";

export async function middleware(request: NextRequest) {
  try {
    return await auth0.middleware(request);
  } catch (error) {
    console.error("Auth0 middleware error:", error);
    console.error("Environment check:", {
      domain: process.env.AUTH0_DOMAIN,
      appBaseUrl: process.env.APP_BASE_URL,
      hasClientId: !!process.env.AUTH0_CLIENT_ID,
      hasClientSecret: !!process.env.AUTH0_CLIENT_SECRET,
      hasSecret: !!process.env.AUTH0_SECRET,
    });
    // Pass through on error to avoid breaking the app
    return NextResponse.next();
  }
}

export const config = {
  // Only protect selected app sections. Do NOT match /api/auth/* or assets.
  matcher: ["/profile/:path*"],
};
