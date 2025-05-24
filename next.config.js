/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placehold.co', 'storage.googleapis.com'],
  },
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
  // Add environment variables
  env: {
    GOOGLE_STORAGE_BUCKET_NAME: 'ecommerce-app-444531.appspot.com',
    GOOGLE_STORAGE_PROJECT_ID: 'ecommerce-app-444531',
    // Updated MongoDB URI with a placeholder - replace with your actual working MongoDB URI
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  },
  output: 'standalone',
  // Add experimental features to improve compatibility with Vercel deployments
  experimental: {
    optimizePackageImports: ['react-icons'],
    optimizeCss: true,
  },
  serverExternalPackages: [],
};

module.exports = nextConfig; 