// lib/auth0.ts
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  routes: {
    callback: "/auth/callback",
  },
  // Default destination after successful sign-in when no returnTo is provided
  signInReturnToPath: "/home",
});
