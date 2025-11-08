/**
 * tRPC Client Configuration
 * Sets up type-safe client for React components
 */

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/routers";
import superjson from "superjson";

/**
 * Type-safe tRPC hooks for React components
 * @example
 *   const { data: tasks } = trpc.task.getAll.useQuery();
 *   const createTask = trpc.task.create.useMutation();
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get the tRPC client configuration
 * Called from the tRPC provider
 */
export function getTRPCClientConfig() {
  return {
    links: [
      httpBatchLink({
        url: getBaseUrl() + "/api/trpc",
        // You can pass any HTTP headers you wish here
        async headers() {
          return {
            // authorization: getAuthCookie(),
          };
        },
      }),
    ],
    transformer: superjson,
  };
}

/**
 * Get base URL for API calls
 * Works in both client and server environments
 */
function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser should use relative path
    return "";
  }

  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }

  // Assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
