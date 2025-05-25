'use client';

import { useState, useRef } from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import { FiUpload, FiImage, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function CloudinaryTestPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string, publicId: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Test Cloudinary connection
  const testConnection = async () => {
    setIsUploading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-cloudinary');
      const data = await response.json();
      
      if (data.success) {
        setTestResult(data);
      } else {
        setError(data.message || 'Failed to test Cloudinary connection');
      }
    } catch (err) {
      setError('Error testing Cloudinary connection');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const files = Array.from(e.target.files);
      const uploadedFiles: Array<{url: string, publicId: string}> = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'perfume_products');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          uploadedFiles.push({
            url: data.url,
            publicId: data.public_id
          });
        } else {
          throw new Error(`Failed to upload ${file.name}: ${data.error}`);
        }
      }
      
      setUploadedImages(prev => [...prev, ...uploadedFiles]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading files');
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Cloudinary Integration Test</h1>
        
        {/* Connection Test */}
        <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Test Cloudinary Connection</h2>
          <button
            onClick={testConnection}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isUploading ? 'Testing...' : 'Test Connection'}
          </button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-green-600 flex items-center">
                <FiCheckCircle className="mr-2" /> Connection Successful
              </h3>
              <div className="mt-2">
                <p className="text-sm font-medium">Upload Test:</p>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Original:</p>
                    <img 
                      src="https://res.cloudinary.com/demo/image/upload/sample.jpg" 
                      alt="Original" 
                      className="w-full h-auto mt-1 border rounded"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Uploaded:</p>
                    <img 
                      src={testResult.upload?.data?.url} 
                      alt="Uploaded" 
                      className="w-full h-auto mt-1 border rounded"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium">Transformations:</p>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Thumbnail:</p>
                    <img 
                      src={testResult.transformations?.data?.thumbnail} 
                      alt="Thumbnail" 
                      className="w-full h-auto mt-1 border rounded"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Optimized:</p>
                    <img 
                      src={testResult.transformations?.data?.optimized} 
                      alt="Optimized" 
                      className="w-full h-auto mt-1 border rounded"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cropped:</p>
                    <img 
                      src={testResult.transformations?.data?.cropped} 
                      alt="Cropped" 
                      className="w-full h-auto mt-1 border rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* File Upload Test */}
        <div className="p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Test Image Upload</h2>
          
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-md cursor-pointer ${
                isUploading ? 'bg-gray-100 border-gray-300' : 'border-blue-300 hover:border-blue-500'
              }`}
            >
              <FiUpload className={`mr-2 ${isUploading ? 'text-gray-400' : 'text-blue-500'}`} />
              <span className={isUploading ? 'text-gray-400' : 'text-blue-600'}>
                {isUploading ? 'Uploading...' : 'Select Images to Upload'}
              </span>
            </label>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {uploadedImages.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Uploaded Images:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <img
                      src={image.url}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-2 bg-gray-50 text-xs truncate">
                      ID: {image.publicId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 