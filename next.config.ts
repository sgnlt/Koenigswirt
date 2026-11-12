import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    qualities: [75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Same targets the live site redirects to; /service-uebersicht is password-protected there.
  async redirects() {
    return [
      { source: "/home-1", destination: "/", permanent: true },
      { source: "/book-a-room", destination: "/", permanent: true },
      { source: "/blank-1", destination: "/impressum", permanent: true },
      { source: "/blog", destination: "/presse", permanent: true },
      {
        source: "/service-uebersicht",
        destination: "/festsaal-mit-buehne",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
