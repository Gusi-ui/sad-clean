import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Asegurar favicon para navegadores que piden .ico
      { source: '/favicon.ico', destination: '/favicon.svg' },
    ];
  },
};

export default nextConfig;
