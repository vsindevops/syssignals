import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      // legacy Jekyll permalinks: /articles/YYYY/MM/DD/slug/ -> /articles/slug
      {
        source: "/articles/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug",
        destination: "/articles/:slug",
        permanent: true,
      },
      // www -> apex
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.syssignals.com" }],
        destination: "https://syssignals.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
