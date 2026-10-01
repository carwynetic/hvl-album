import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  allowedDevOrigins: ["192.168.2.4"],
  images: {
    unoptimized: true,
  },
};


export default nextConfig;
