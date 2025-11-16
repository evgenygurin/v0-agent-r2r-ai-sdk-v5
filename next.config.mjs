import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
  compress: false,
  outputFileTracingRoot: __dirname,
}

export default nextConfig
