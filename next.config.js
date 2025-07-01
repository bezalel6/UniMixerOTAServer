/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Configure API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // File upload configuration
  experimental: {
    serverComponentsExternalPackages: [],
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Environment variables available to the browser
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Allow serving binary files
  async headers() {
    return [
      {
        source: '/api/firmware/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/octet-stream',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 
