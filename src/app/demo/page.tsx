'use client';

import Link from 'next/link';
import { FiImage, FiExternalLink } from 'react-icons/fi';

export default function DemoLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Perfume E-commerce Demos</h1>
            <p className="text-gray-600 text-lg">
              Explore our technical demos showcasing various features of the e-commerce platform
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cloudinary Demo */}
            <Link 
              href="/demo/cloudinary"
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <FiImage className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    Cloudinary Image Demo
                    <FiExternalLink className="ml-2 w-4 h-4 text-gray-400" />
                  </h2>
                  <p className="text-gray-600">
                    Explore how we use Cloudinary to optimize images with automatic format conversion,
                    responsive sizing, and various transformations.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Optimization</span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Transformations</span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Responsive</span>
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Admin Cloudinary Test */}
            <Link 
              href="/admin/cloudinary-test"
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <FiImage className="text-purple-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    Admin Cloudinary Test
                    <FiExternalLink className="ml-2 w-4 h-4 text-gray-400" />
                  </h2>
                  <p className="text-gray-600">
                    Test the Cloudinary integration in the admin panel, including image uploads,
                    transformations, and API connectivity.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">Admin</span>
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">Upload</span>
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">API Test</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              href="/store-routes"
              className="inline-block px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Go to Main Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 