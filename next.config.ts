import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        // Optional: specify the port if needed (usually 443 for https)
        // port: '',
        // Optional: specify the pathname prefix if you want to restrict to specific paths
        // pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
