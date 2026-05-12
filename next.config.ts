/** @type {import('next').NextConfig} */

const nextConfig = {
  trailingSlash: false,
  reactStrictMode: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: `${process.env.NEXT_PUBLIC_S3_PREFIX}`,
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: `${process.env.NEXT_PUBLIC_API_ROOT}/:path*`,
        destination: `${process.env.NEXT_PUBLIC_BASE_URL}:${process.env.NEXT_PUBLIC_API_PORT}${process.env.NEXT_PUBLIC_API_ROOT}/:path*`
      },
      {
        source: '/ogp',
        destination: '/api/ogp',
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  }
};

export default nextConfig;