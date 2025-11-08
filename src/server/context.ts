/**
 * tRPC Context
 * Creates context for each request including database and user session
 */

import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { prisma } from "./db";
import { auth0 } from "@/lib/auth0";

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Retrieve Auth0 session from the incoming request
  // Note: our Auth0 client supports App Router Requests
  let session: unknown = null;
  let userId: string | null = null;
  try {
    // auth0.getSession can accept the standard Request in App Router
    const s = (await (
      auth0 as unknown as {
        getSession: (
          req: Request
        ) => Promise<{ user?: { sub?: string; [k: string]: unknown } } | null>;
      }
    ).getSession(opts.req)) as { user?: { sub?: string } } | null;
    session = s;
    userId = s?.user?.sub ?? null; // Auth0 subject as stable user id
  } catch {
    // No session available
    session = null;
    userId = null;
  }

  return {
    prisma,
    session,
    userId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
