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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
  // Add environment variables
  env: {
    GOOGLE_STORAGE_BUCKET_NAME: 'ecommerce-app-444531.appspot.com',
    GOOGLE_STORAGE_PROJECT_ID: 'ecommerce-app-444531',
    MONGODB_URI: 'mongodb+srv://avitoluxury:l2AuSv97J5FW4ZvU@freetester.667mr8b.mongodb.net/ecommerce',
    JWT_SECRET: 'aviotoluxury_admin_secret_key_2025',
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PHONE: '8126518755',
    CLOUDINARY_API_SECRET: 'cloudinary://992368173733427:kQuf9IxR7a503I0y-J_QVzx4RI8@dzzxpyqif' // Replace with your actual API secret
  },
  output: 'standalone',
  // Add experimental features to improve compatibility with Vercel deployments
  experimental: {
    optimizePackageImports: ['react-icons'],
    optimizeCss: true,
  },
  serverExternalPackages: [],
  // Handle Node.js modules in webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
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