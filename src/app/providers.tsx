"use client";

import { ThemeProvider } from "@/components/theme-provider";

// Central app providers live here (kept minimal for performance)
export default function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
