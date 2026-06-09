import path from 'path';
import type { NextConfig } from 'next';

const RAILWAY_API = 'https://api.raos.uz';
const API_BASE = process.env.INTERNAL_API_URL || RAILWAY_API;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Monorepo: trace files from repo root so shared packages are included
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Compress responses (gzip/brotli) for smaller payloads
  compress: true,
  // Reduce JS bundle size by enabling tree-shaking for barrel exports
  modularizeImports: {
    'lucide-react': { transform: 'lucide-react/dist/esm/icons/{{ kebabCase member }}' },
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_BASE}/api/v1/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Cache static assets aggressively
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
