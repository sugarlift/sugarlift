import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    minimumCacheTTL: 60 * 60 * 24 * 1,
    domains: ["ndnxcumwsgbbvfwjxkdi.supabase.co"],
  },
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default nextConfig;
