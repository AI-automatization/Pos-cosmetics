import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Monorepo: trace files from repo root so shared packages are included
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
