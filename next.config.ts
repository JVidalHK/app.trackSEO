import type { NextConfig } from "next";

const isProduction = process.env.NEXT_PUBLIC_APP_URL === "https://app.trackseo.pro";

const nextConfig: NextConfig = {
  // Block all crawlers on non-production deployments
  ...(!isProduction && {
    headers: async () => [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ],
  }),
};

export default nextConfig;
