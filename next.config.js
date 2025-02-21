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
      {
        protocol: "https",
        hostname: "v5.airtableusercontent.com",
      },
    ],
  },
  redirects: async () => [
    // Special cases for accented/special characters
    {
      source: "/artist/anna-n%C3%BA%C3%B1ez",
      destination: "/artists/anna-nunez",
      permanent: true,
    },
    {
      source: "/artist/daniel-gr%C3%BCttner",
      destination: "/artists/daniel-gruttner",
      permanent: true,
    },
    {
      source: "/artist/thorbj%C3%B8rn-bechmann",
      destination: "/artists/thorbjorn-bechmann",
      permanent: true,
    },
    {
      source: "/artist/nicholas-o'leary",
      destination: "/artists/nicholas-o-leary",
      permanent: true,
    },
    {
      source: "/artist/lorena-fr%C3%ADas",
      destination: "/artists/lorena-frias",
      permanent: true,
    },
    // Artwork page redirects to artist page
    {
      source: "/artist/:slug/:artwork*",
      destination: "/artists/:slug",
      permanent: true,
    },
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
