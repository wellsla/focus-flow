/** @type {import('next').NextConfig} */
const enableReactCompiler =
  process.env.NEXT_PUBLIC_REACT_COMPILER !== "off" &&
  process.env.NODE_ENV !== "production";

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://localhost:9003";

const nextConfig = {
  /* config options here */
  experimental: {
    // Disable React Compiler in production to avoid potential runtime issues; can be re-enabled with env flag
    reactCompiler: enableReactCompiler,
  },
  // Note: These are temporarily enabled for development speed
  // TODO: Remove these and fix all TypeScript/ESLint errors before production
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/dashboard",
        destination: `${BACKEND_ORIGIN}/dashboard`,
      },
    ];
  },
};

module.exports = nextConfig;
