import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    hasAppBaseUrl: !!process.env.APP_BASE_URL,
    hasAuth0Domain: !!process.env.AUTH0_DOMAIN,
    hasAuth0ClientId: !!process.env.AUTH0_CLIENT_ID,
    hasAuth0ClientSecret: !!process.env.AUTH0_CLIENT_SECRET,
    hasAuth0Secret: !!process.env.AUTH0_SECRET,
    appBaseUrl: process.env.APP_BASE_URL?.substring(0, 30) + "...", // Show partial for security
    auth0Domain: process.env.AUTH0_DOMAIN?.substring(0, 20) + "...",
  };

  return NextResponse.json(config);
}
