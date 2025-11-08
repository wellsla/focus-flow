import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Prefer APP_BASE_URL (used by Auth0 SDK) then AUTH0_BASE_URL, then a safe default.
  const baseUrl =
    process.env.APP_BASE_URL ||
    process.env.AUTH0_BASE_URL ||
    "https://ws-focus-flow.vercel.app";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
