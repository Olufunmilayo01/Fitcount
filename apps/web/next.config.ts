import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow local public images with no size restriction
    unoptimized: true,
  },
};

export default nextConfig;
