"use client";

// Auth0 v4 doesn't export UserProvider for client; useUser hook works without it
// No provider wrapper needed for client components
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
