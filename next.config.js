/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BUILD_TIME:
      process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV
        ? "true"
        : "false",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ndnxcumwsgbbvfwjxkdi.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // ... other config
};

module.exports = nextConfig;
