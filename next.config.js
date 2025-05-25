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
    domains: ['placehold.co', 'storage.googleapis.com', 'res.cloudinary.com'],
  },
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
  // Add environment variables
  env: {
    GOOGLE_STORAGE_BUCKET_NAME: 'ecommerce-app-444531.appspot.com',
    GOOGLE_STORAGE_PROJECT_ID: 'ecommerce-app-444531',
    MONGODB_URI: 'mongodb+srv://avitoluxury:l2AuSv97J5FW4ZvU@freetester.667mr8b.mongodb.net/ecommerce',
    JWT_SECRET: 'fraganote_admin_secret_key_2025',
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PHONE: '8126518755',
    CLOUDINARY_API_SECRET: 'YOUR_CLOUDINARY_API_SECRET_HERE', // Replace with your actual API secret
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'dzzxpyqif',
    NEXT_PUBLIC_CLOUDINARY_API_KEY: '992368173733427'
  },
  output: 'standalone',
  // Add experimental features to improve compatibility with Vercel deployments
  experimental: {
    optimizePackageImports: ['react-icons'],
    optimizeCss: true,
  },
  serverExternalPackages: [],
  async redirects() {
    return [
      {
        source: '/store',
        destination: '/store-routes/store',
        permanent: true,
      },
      {
        source: '/store/:path*',
        destination: '/store-routes/store/:path*',
        permanent: true,
      },
      {
        source: '/product/:path*',
        destination: '/store-routes/product/:path*',
        permanent: true,
      }
    ]
  }
};

module.exports = nextConfig; 