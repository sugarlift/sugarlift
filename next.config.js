/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BUILD_TIME:
      process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV
        ? "true"
        : "false",
  },
  // ... other config
};

module.exports = nextConfig;
