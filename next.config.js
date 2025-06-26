/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost", "api.cloudinary.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable experimental ESM support
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['pg', 'drizzle-orm', 'drizzle-orm/node-postgres']
  },
  // Configure webpack to handle .js extensions for ES modules
  webpack: (config, { isServer }) => {
    // Resolve .js extensions
    config.resolve.extensions.push('.js');
    
    // Important: return the modified config
    return config;
  }
}

module.exports = nextConfig
