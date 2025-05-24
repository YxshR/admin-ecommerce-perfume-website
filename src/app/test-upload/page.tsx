'use client';

import { useState } from 'react';
import { FiUpload } from 'react-icons/fi';

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };
  
  // Test Cloudinary connection
  const testConnection = async () => {
    try {
      setConnectionStatus({ loading: true });
      
      const response = await fetch('/api/test-cloudinary');
      const data = await response.json();
      
      setConnectionStatus({
        loading: false,
        success: data.success,
        data
      });
    } catch (err: any) {
      setConnectionStatus({
        loading: false,
        success: false,
        error: err.message
      });
    }
  };
  
  // Upload file
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      setResult(null);
      
      // Determine resource type based on file mime type
      const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceType', resourceType);
      
      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      // Parse response
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || 'Upload failed');
      }
      
      setResult(data);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test Cloudinary Upload</h1>
      
      {/* Test connection */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-4">1. Test Cloudinary Connection</h2>
        
        <button
          onClick={testConnection}
          disabled={connectionStatus?.loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {connectionStatus?.loading ? 'Testing...' : 'Test Connection'}
        </button>
        
        {connectionStatus && !connectionStatus.loading && (
          <div className="mt-4">
            <h3 className="font-medium">
              {connectionStatus.success ? (
                <span className="text-green-600">Connection successful!</span>
              ) : (
                <span className="text-red-600">Connection failed</span>
              )}
            </h3>
            
            <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto text-xs">
              {JSON.stringify(connectionStatus.data || connectionStatus.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {/* File upload */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-4">2. Test File Upload</h2>
        
        <div className="mb-4">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            <FiUpload className="mr-2" />
            Select File
          </label>
          
          {file && (
            <span className="ml-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </span>
          )}
        </div>
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {result && (
          <div className="mt-4">
            <h3 className="font-medium text-green-600">Upload successful!</h3>
            
            {result.url && (
              <div className="mt-2">
                <p className="text-sm font-medium">Preview:</p>
                {result.url.includes('video') ? (
                  <video
                    src={result.url}
                    controls
                    className="mt-2 max-w-md rounded-md"
                    style={{ maxHeight: '300px' }}
                  />
                ) : (
                  <img
                    src={result.url}
                    alt="Uploaded"
                    className="mt-2 max-w-md rounded-md"
                    style={{ maxHeight: '300px' }}
                  />
                )}
              </div>
            )}
            
            <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 