/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
  // Disable static optimization to prevent error page generation issues
  // All pages will be rendered on-demand
  generateBuildId: async () => 'build',
  compress: false,
}

export default nextConfig
