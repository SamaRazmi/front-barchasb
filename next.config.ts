import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "barchasb-admin-server.ir",
        pathname: "/**",
      },
    ],
  },
  // ======== حذف یا کامنت کردن rewrites ========
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "http://localhost:5000/api/:path*",
  //     },
  //   ];
  // },
  // ===========================================
};

export default nextConfig;
