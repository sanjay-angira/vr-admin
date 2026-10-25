import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    unoptimized:
      process.env.NEXT_IMAGE_UNOPTIMIZED === "1" ||
      process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.vrindavanrasa.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "https",
        hostname: "vrindavan-rasa.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "vrindavan-rasa.s3.amazonaws.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/logo/logo.svg",
      },
    ];
  },
};

export default nextConfig;
