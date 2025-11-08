// lib/auth0.ts
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  // Auth0ClientOptions doesn't expose baseURL; rely on env AUTH0_BASE_URL instead.
  routes: {
    login: "/auth/login",
    logout: "/auth/logout",
    callback: "/auth/callback",
  },
  // Default destination after successful sign-in when no returnTo provided.
  signInReturnToPath: "/home",
});
