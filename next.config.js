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
                // Create necessary directories if they don't exist
                const directories = [
                  path.join(__dirname, '.next/server/app/(store)'),
                  path.join(__dirname, '.next/server/app/(admin)'),
                  path.join(__dirname, '.next/server/app/admin'),
                ];
                
                directories.forEach(dir => {
                  if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                  }
                });
                
                // Copy the manifest file to all important directories
                directories.forEach(dir => {
                  const targetManifestPath = path.join(dir, 'page_client-reference-manifest.js');
                  fs.copyFileSync(sourceManifestPath, targetManifestPath);
                });
                
                console.log('Successfully copied client reference manifests to all directories');
              } else {
                console.warn('Source manifest file not found:', sourceManifestPath);
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