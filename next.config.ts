import type { NextConfig } from "next";

const serverActionOrigins = process.env.SERVER_ACTION_ALLOWED_ORIGINS?.split(
  ",",
)
  .map((origin) => origin.trim())
  .filter(Boolean);
const scriptPolicy =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      ...(serverActionOrigins?.length
        ? { allowedOrigins: serverActionOrigins }
        : {}),
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self' https://www.facebook.com",
              "frame-ancestors 'self'",
              "img-src 'self' blob: data: https://*.supabase.co https://www.facebook.com",
              "font-src 'self' data:",
              "style-src 'self' 'unsafe-inline'",
              scriptPolicy,
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https://www.google.com https://maps.google.com",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
