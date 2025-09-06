/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  transpilePackages: ["@chakra-ui/react", "@chakra-ui/next-js"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "http", hostname: "tong.visitkorea.or.kr" },
      { protocol: "https", hostname: "tong.visitkorea.or.kr" },
      { protocol: "https", hostname: "api.visitkorea.or.kr" },
      { protocol: "https", hostname: "korean.visitkorea.or.kr" },
      { protocol: "https", hostname: "www.visitkorea.or.kr" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "3.34.52.239", port: "8080" },
      { protocol: "http", hostname: "localhost", port: "8080" },
      { protocol: "http", hostname: "127.0.0.1", port: "8080" },
    ],
    domains: [
      "cdn.pixabay.com",
      "apis.data.go.kr",
      "tong.visitkorea.or.kr",
      "43.200.177.95",
      "images.unsplash.com",
      "3.34.52.239",
      "localhost",
      "127.0.0.1",
    ],
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

module.exports = nextConfig;
