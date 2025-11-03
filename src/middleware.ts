import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(req: NextRequest) {
  return auth0.middleware(req);
}

// Only protect app sections, not /auth/* or assets
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/applications/:path*",
    "/finances/:path*",
    "/goals/:path*",
    "/routine/:path*",
    "/roadmap/:path*",
    "/performance/:path*",
    "/time-management/:path*",
    "/home/:path*",
  ],
};
