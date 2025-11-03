// middleware.ts
import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

// Let the SDK serve /auth/* (login, callback, logout, profile, access-token)
export function middleware(req: NextRequest) {
  return auth0.middleware(req);
}

// Mount middleware ONLY for the auth endpoints and NOT for the rest of the app
export const config = {
  matcher: ["/auth/:path*"], // <— important
};
