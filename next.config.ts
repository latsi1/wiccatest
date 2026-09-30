import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep development output separate so a production build cannot corrupt
  // the files used by an already-running development server.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
