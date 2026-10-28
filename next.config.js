/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server action & external packages for Node.js worker/crawler compatibility
  experimental: {
    serverComponentsExternalPackages: ['bullmq', 'ioredis', 'pdfkit', 'cheerio', '@prisma/client', 'prisma'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
