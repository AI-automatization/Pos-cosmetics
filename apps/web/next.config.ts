import path from 'path';
import type { NextConfig } from 'next';

const RAILWAY_API = 'https://api-production-c5b6.up.railway.app';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Monorepo: trace files from repo root so shared packages are included
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${RAILWAY_API}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
