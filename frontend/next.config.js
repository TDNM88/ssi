/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://inal-hsc-api.vercel.app/api/:path*'
          : 'http://localhost:3000/api/:path*'
      },
      {
        source: '/ws/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'wss://inal-hsc-api.vercel.app/:path*'
          : 'ws://localhost:3000/:path*'
      }
    ];
  },
};

export default nextConfig;
