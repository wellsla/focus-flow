import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  routes: {
    login: "/auth/login",
    logout: "/auth/logout",
    callback: "/auth/callback",
  },
});
