import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Enable static image imports from the public directory
    unoptimized: false,
  },
};

export default nextConfig;
