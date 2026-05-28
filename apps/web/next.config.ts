import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@alice/shared'],
};

export default nextConfig;
