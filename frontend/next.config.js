/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Optimize build output
  compress: true,
  poweredByHeader: false,
  
  // Configure image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  },
  
  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts'],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000',
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, immutable', // 30 days
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
