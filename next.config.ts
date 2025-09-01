import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ucarecdn.com", pathname: "/**" },
      { protocol: "https", hostname: "**.ucarecdn.net", pathname: "/**" },
    ],
  },
  // dočasne môžeš nechať tieto poistky
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
