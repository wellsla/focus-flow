import { NextResponse } from "next/server";

// Temporarily pass-through middleware to avoid auth-related redirect loops during setup
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  // Only protect selected app sections. Do NOT match /api/auth/* or assets.
  matcher: ["/profile/:path*"],
};
