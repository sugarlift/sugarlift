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
  redirects: async () => [
    // Artist redirects
    {
      source: "/artist/:slug",
      destination: "/artists/:slug",
      permanent: true,
    },
    {
      source: "/artist",
      destination: "/artists",
      permanent: true,
    },
    // Exhibition redirects
    {
      source: "/exhibition/:slug",
      destination: "/exhibitions/:slug",
      permanent: true,
    },
    {
      source: "/exhibition",
      destination: "/exhibitions",
      permanent: true,
    },
    // Projects redirects
    {
      source: "/projects",
      destination: "/clients",
      permanent: true,
    },
    {
      source: "/project/:slug",
      destination: "/clients/:slug",
      permanent: true,
    },
  ],
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
};

module.exports = nextConfig;
