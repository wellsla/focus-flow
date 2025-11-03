"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error so we can see details in production console
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">
        An unexpected error occurred. You can try again or go back to the
        previous page.
      </p>
      <div className="flex gap-2">
        <button
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm"
          onClick={() => reset()}
        >
          Try again
        </button>
        <Link
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm"
          href="/"
        >
          Go home
        </Link>
      </div>
      {/* Lightweight diagnostics to help in production without exposing too much */}
      {error?.digest ? (
        <p className="text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      ) : null}
      {error?.message ? (
        <details className="mt-2 max-w-3xl text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Show details
          </summary>
          <pre className="mt-2 whitespace-pre-wrap break-words text-xs bg-muted p-3 rounded-md">
            {error.message}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
