/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Configure experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  skipTrailingSlashRedirect: true,
  compress: false,
}

export default nextConfig
