import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pangu/ui", "@pangu/api-client"],
};

export default nextConfig;
