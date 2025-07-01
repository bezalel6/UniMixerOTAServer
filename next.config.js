/** @type {import('next').NextConfig} */
const nextConfig = {
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
