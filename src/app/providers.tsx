"use client";

// Auth0 v4 doesn't export UserProvider for client
// useUser() hook works directly and fetches /auth/profile internally
// No provider wrapper needed
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
