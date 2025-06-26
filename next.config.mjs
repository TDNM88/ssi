/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['drizzle-orm', 'pg'],
  experimental: {
    // Other experimental configurations can go here
  },
}

export default nextConfig
