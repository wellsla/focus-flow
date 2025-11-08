import { NextResponse } from "next/server";

// Proxy to an external backend (configurable). This avoids CORS and stabilizes
// the RSC stream by ensuring we always return JSON from our own origin.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://localhost:9003";

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${BACKEND_ORIGIN}/dashboard`, {
      signal: controller.signal,
      // Do not cache failures; always revalidate
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Upstream returned ${res.status}` },
        { status: 502 }
      );
    }

    // Try to parse upstream JSON safely
    try {
      const data = await res.json();
      return NextResponse.json({ ok: true, data }, { status: 200 });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON from upstream" },
        { status: 502 }
      );
    }
  } catch (e: unknown) {
    const aborted =
      e &&
      typeof e === "object" &&
      "name" in e &&
      (e as { name?: unknown }).name === "AbortError";
    return NextResponse.json(
      {
        ok: false,
        error: aborted ? "Upstream timeout" : "Upstream fetch failed",
      },
      { status: 504 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
