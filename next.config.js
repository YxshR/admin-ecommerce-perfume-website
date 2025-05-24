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
    MONGODB_URI: 'mongodb+srv://Yash:f500A06khWmFn4Qd@yash.pweao0h.mongodb.net/?retryWrites=true&w=majority&appName=Yash',
  },
  output: 'standalone',
  // Add experimental features to improve compatibility with Vercel deployments
  experimental: {
    optimizePackageImports: ['react-icons'],
    optimizeCss: true,
  },
  serverExternalPackages: [],
  // Add custom webpack configuration to handle client reference manifests
  webpack: (config, { isServer, dev }) => {
    // Fix for client reference manifest issues in app router
    if (!isServer && !dev) {
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('CopyClientReferenceManifest', (compilation) => {
            // This ensures the client reference manifest is available in all directories
            const fs = require('fs');
            const path = require('path');
            
            try {
              // Source manifest file
              const sourceManifestPath = path.join(__dirname, '.next/server/app/page_client-reference-manifest.js');
              
              if (fs.existsSync(sourceManifestPath)) {
                // Create (store) directory if it doesn't exist
                const targetDir = path.join(__dirname, '.next/server/app/(store)');
                if (!fs.existsSync(targetDir)) {
                  fs.mkdirSync(targetDir, { recursive: true });
                }
                
                // Copy the manifest file to the (store) directory
                const targetManifestPath = path.join(targetDir, 'page_client-reference-manifest.js');
                fs.copyFileSync(sourceManifestPath, targetManifestPath);
              }
            } catch (error) {
              console.error('Error copying client reference manifest:', error);
            }
          });
        }
      });
    }
    return config;
  },
};

module.exports = nextConfig; 