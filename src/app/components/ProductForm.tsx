'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiX, FiUpload } from 'react-icons/fi';

// Google Cloud Storage API endpoint
const API_UPLOAD_ENDPOINT = '/api/upload';

interface Product {
  _id: string;
  name: string;
  description: string;
  referenceName: string;
  price: number;
  discountedPrice: number;
  stock: number;
  category: string;
  images: ProductImage[];
  videos: ProductVideo[];
  featured: boolean;
  new_arrival: boolean;
  best_seller: boolean;
}

interface ProductFormProps {
  initialData?: Partial<Product>;
  isEditing?: boolean;
  onSuccess?: () => void;
}

interface ProductImage {
  public_id: string;
  url: string;
}

interface ProductVideo {
  public_id: string;
  url: string;
}

interface ProductFormData {
  name: string;
  description: string;
  referenceName: string;
  price: number;
  discountedPrice: number;
  stock: number;
  category: string;
  images: ProductImage[];
  videos: ProductVideo[];
}

const categories = [
  'Electronics',
  'Cameras',
  'Laptops',
  'Accessories',
  'Headphones',
  'Food',
  'Books',
  'Clothes',
  'Shoes',
  'Beauty',
  'Health',
  'Sports',
  'Outdoor',
  'Home'
];

const ProductForm: React.FC<ProductFormProps> = ({ 
  initialData = {}, 
  isEditing = false,
  onSuccess
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    referenceName: initialData.referenceName || '',
    price: initialData.price || 0,
    discountedPrice: initialData.discountedPrice || 0,
    stock: initialData.stock || 0,
    category: initialData.category || categories[0],
    images: initialData.images || [],
    videos: initialData.videos || [],
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(initialData.featured || false);
  const [isNewArrival, setIsNewArrival] = useState(initialData.new_arrival || false);
  const [isBestSeller, setIsBestSeller] = useState(initialData.best_seller || false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'discountedPrice' || name === 'stock' 
        ? parseFloat(value) 
        : value
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      
      // Create temporary URLs for preview
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setUploadedImages(previewUrls);
    }
  };
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setVideoFiles(files);
      
      // Create temporary URLs for preview
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setUploadedVideos(previewUrls);
    }
  };

  // Upload file to Google Cloud Storage
  const uploadToStorage = async (file: File, resourceType: 'image' | 'video') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resourceType', resourceType);
    formData.append('folder', resourceType === 'image' ? 'product_images' : 'product_videos');
    
    try {
      const response = await fetch(API_UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      return {
        public_id: data.public_id,
        url: data.url
      };
    } catch (err) {
      console.error(`Error uploading ${resourceType}:`, err);
      throw new Error(`Failed to upload ${resourceType}`);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Process and upload image files if any are selected
      let newImages = [...formData.images];
      
      if (imageFiles.length > 0) {
        setUploadStatus('Uploading images to storage...');
        
        // Upload each image to Google Cloud Storage
        const uploadPromises = imageFiles.map(file => uploadToStorage(file, 'image'));
        const uploadedImagesData = await Promise.all(uploadPromises);
        
        // Replace existing images with new ones
        newImages = uploadedImagesData;
        setUploadStatus('Images uploaded successfully!');
      }
      
      // Process and upload video files if any are selected
      let newVideos = [...formData.videos];
      
      if (videoFiles.length > 0) {
        setUploadStatus('Uploading videos to storage...');
        
        // Upload each video to Google Cloud Storage
        const uploadPromises = videoFiles.map(file => uploadToStorage(file, 'video'));
        const uploadedVideosData = await Promise.all(uploadPromises);
        
        // Add new videos
        newVideos = [...newVideos, ...uploadedVideosData];
        setUploadStatus('Videos uploaded successfully!');
      }
      
      setUploadStatus('Saving product data...');
      
      // Prepare final product data
      const productData = {
        ...formData,
        images: newImages,
        videos: newVideos,
        featured: isFeatured,
        new_arrival: isNewArrival,
        best_seller: isBestSeller
      };
      
      if (isEditing && initialData._id) {
        await axios.put(`/api/products/${initialData._id}`, productData);
      } else {
        await axios.post('/api/products', productData);
      }
      
      setUploadStatus('Product saved successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product. Please try again.');
      setUploadStatus('');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {uploadStatus && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
          {uploadStatus}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            required
          />
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference Name (Alternative search terms)
          </label>
          <input
            type="text"
            name="referenceName"
            value={formData.referenceName}
            onChange={handleChange}
            placeholder="Alternative names, keywords, or common search terms"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <p className="mt-1 text-xs text-gray-500">Add alternative names that customers might search for</p>
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discounted Price ($)
          </label>
          <input
            type="number"
            name="discountedPrice"
            value={formData.discountedPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            required
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
              <FiUpload size={24} className="mb-2 text-gray-400" />
              <span className="text-sm text-gray-600 font-medium">Upload Product Images</span>
              <span className="text-xs text-gray-500 mt-1">Click to browse files</span>
            </label>
            <p className="mt-2 text-xs text-gray-500">
              {imageFiles.length > 0 ? `${imageFiles.length} files selected` : 'JPEG, PNG up to 5MB'}
            </p>
          </div>
          
          {uploadedImages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Image Previews:</h4>
              <div className="grid grid-cols-4 gap-2">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...uploadedImages];
                        const newFiles = [...imageFiles];
                        newImages.splice(index, 1);
                        newFiles.splice(index, 1);
                        setUploadedImages(newImages);
                        setImageFiles(newFiles);
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-sm"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show existing images if editing */}
          {isEditing && formData.images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images:</h4>
              <div className="grid grid-cols-4 gap-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image.url} alt={`Product image ${index}`} className="w-full h-24 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index)
                        }));
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-sm"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Videos
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoChange}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center justify-center">
              <FiUpload size={24} className="mb-2 text-gray-400" />
              <span className="text-sm text-gray-600 font-medium">Upload Product Videos</span>
              <span className="text-xs text-gray-500 mt-1">Click to browse files</span>
            </label>
            <p className="mt-2 text-xs text-gray-500">
              {videoFiles.length > 0 ? `${videoFiles.length} files selected` : 'MP4, WEBM up to 50MB'}
            </p>
          </div>
          
          {uploadedVideos.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Video Files:</h4>
              <div className="space-y-2">
                {videoFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newVideos = [...uploadedVideos];
                        const newFiles = [...videoFiles];
                        newVideos.splice(index, 1);
                        newFiles.splice(index, 1);
                        setUploadedVideos(newVideos);
                        setVideoFiles(newFiles);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show existing videos if editing */}
          {isEditing && formData.videos.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Videos:</h4>
              <div className="space-y-2">
                {formData.videos.map((video, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm truncate max-w-xs">{video.url.split('/').pop()}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          videos: prev.videos.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-2">
          <h3 className="block text-sm font-medium text-gray-700 mb-3">Display Options</h3>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Featured Product</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">New Arrival</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Best Seller</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <FiSave className="mr-2" />
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm; 