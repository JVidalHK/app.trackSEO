import type { NextConfig } from "next";

const isProduction = process.env.NEXT_PUBLIC_APP_URL === "https://app.trackseo.pro";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        // Prevent clickjacking - block all iframe embedding
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        // Prevent MIME type sniffing
        { key: "X-Content-Type-Options", value: "nosniff" },
        // XSS protection (legacy browsers)
        { key: "X-XSS-Protection", value: "1; mode=block" },
        // Referrer policy
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // Permissions policy - disable unnecessary browser features
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        // Strict transport security
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        // Block non-production indexing
        ...(!isProduction ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
      ],
    },
  ],
};

export default nextConfig;
