import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: 'https://app.raos.uz/login',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        // All routes: base security headers
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Non-demo pages: block iframe embedding
        source: '/((?!demos/).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        // Demo pages: allow same-origin iframe (for VideoModal)
        source: '/demos/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

export default nextConfig
