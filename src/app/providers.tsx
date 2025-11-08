"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { trpc, getTRPCClientConfig } from "@/lib/trpc";

// Central app providers live here (kept minimal for performance)
export default function Providers({ children }: { children: React.ReactNode }) {
  // Create React Query client (once per session)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Create tRPC client (once per session)
  const [trpcClient] = useState(() => trpc.createClient(getTRPCClientConfig()));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
