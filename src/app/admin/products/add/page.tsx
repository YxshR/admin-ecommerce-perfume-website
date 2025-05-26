'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiLogOut, FiSettings, FiSave, FiPlusCircle, FiImage, FiVideo, FiX, FiArrowUp, FiArrowDown, FiMail } from 'react-icons/fi';
import AdminLayout from '@/app/components/AdminLayout';
import { useAdminAuth, getAdminToken } from '@/app/lib/admin-auth';

// Define product type
interface ProductMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  file?: File;
  preview?: string;
}

interface ProductData {
  name: string;
  category: string[];
  gender: string;
  volume: string;
  price: number;
  discountPrice?: number;
  description: string;
  about: string;
  disclaimer: string;
  media: ProductMedia[];
  featured: boolean;
  inStock: boolean;
  quantity: number;
}

export default function AddProductPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Product form state
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    category: [],
    gender: '',
    volume: '',
    price: 0,
    discountPrice: undefined,
    description: '',
    about: '',
    disclaimer: '',
    media: [],
    featured: false,
    inStock: true,
    quantity: 100
  });
  
  // Available categories
  const categoryOptions = [
    'Woody', 'Floral', 'Fruity', 'Fresh', 
    'Sweet', 'Spicy', 'Oriental', 'Citrus', 
    'Aquatic', 'Musky', 'Powdery', 'Green',
    'Signature', 'Bestseller', 'New Arrival'
  ];
  
  // Gender options
  const genderOptions = ['Him', 'Her', 'Unisex'];
  
  // Volume options
  const volumeOptions = ['10ml', '30ml', '50ml', '100ml', '200ml'];
  
  useEffect(() => {
    // The useAdminAuth hook handles authentication check and redirects
    if (!authLoading && isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setProductData(prev => {
      const newCategories = prev.category.includes(category) 
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category];
      
      return {
        ...prev,
        category: newCategories
      };
    });
  };
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsSaving(true);
    setSaveError('');
    
    try {
      // Check if we already have 6 images
      const currentImages = productData.media.filter(m => m.type === 'image');
      if (currentImages.length >= 6) {
        throw new Error('Maximum 6 images allowed per product');
      }
      
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'product_images');
      
      console.log('Uploading image:', file.name);
      
      // Upload to Cloudinary via our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Upload failed with status:', response.status);
        console.error('Error details:', data);
        throw new Error(data.error || data.details || 'Upload failed');
      }
      
      if (data.success) {
        console.log('Upload successful:', data);
        
        // Add the uploaded image to the list
        setProductData(prev => {
          return {
            ...prev,
            media: [...prev.media, { 
              id: data.public_id, 
              type: 'image', 
              url: data.url,
              preview: data.url
            }]
          };
        });
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
    } finally {
      setIsSaving(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsSaving(true);
    setSaveError('');
    
    try {
      // Check if we already have 2 videos
      const currentVideos = productData.media.filter(m => m.type === 'video');
      if (currentVideos.length >= 2) {
        throw new Error('Maximum 2 videos allowed per product');
      }
      
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceType', 'video');
      formData.append('folder', 'product_videos');
      
      console.log('Uploading video:', file.name);
      
      // Upload to Cloudinary via our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Upload failed with status:', response.status);
        console.error('Error details:', data);
        throw new Error(data.error || data.details || 'Upload failed');
      }
      
      if (data.success) {
        console.log('Upload successful:', data);
        
        // Add the uploaded video to the list
        setProductData(prev => {
          return {
            ...prev,
            media: [...prev.media, { 
              id: data.public_id, 
              type: 'video', 
              url: data.url,
              preview: data.url
            }]
          };
        });
      } else {
        throw new Error(data.error || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to upload video. Please try again.');
    } finally {
      setIsSaving(false);
      // Reset the file input
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };
  
  // Handle media deletion
  const handleDeleteMedia = async (id: string) => {
    // Find the media item to delete
    const mediaItem = productData.media.find(item => item.id === id);
    
    if (mediaItem) {
      // If the URL is from Cloudinary, delete it from the server
      if (mediaItem.url.includes('res.cloudinary.com')) {
        try {
          const response = await fetch(`/api/upload?publicId=${encodeURIComponent(id)}&resourceType=${mediaItem.type}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            console.error('Failed to delete media from Cloudinary');
          }
        } catch (error) {
          console.error('Error deleting media from Cloudinary:', error);
        }
      }
    }
    
    // Remove from local state regardless of server deletion result
    setProductData(prev => ({
      ...prev,
      media: prev.media.filter(item => item.id !== id)
    }));
  };
  
  // Move media item up in the list
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    setProductData(prev => {
      const newMedia = [...prev.media];
      const temp = newMedia[index];
      newMedia[index] = newMedia[index - 1];
      newMedia[index - 1] = temp;
      
      return {
        ...prev,
        media: newMedia
      };
    });
  };
  
  // Move media item down in the list
  const handleMoveDown = (index: number) => {
    if (index === productData.media.length - 1) return;
    
    setProductData(prev => {
      const newMedia = [...prev.media];
      const temp = newMedia[index];
      newMedia[index] = newMedia[index + 1];
      newMedia[index + 1] = temp;
      
      return {
        ...prev,
        media: newMedia
      };
    });
  };
  
  // Form validation
  const validateForm = (): string => {
    if (!productData.name.trim()) return 'Product name is required';
    if (productData.category.length === 0) return 'Please select at least one category';
    if (!productData.gender) return 'Please select a gender';
    if (!productData.volume) return 'Please select product volume';
    if (productData.price <= 0) return 'Price must be greater than 0';
    
    // Check if at least one image is uploaded
    const hasImages = productData.media.some(m => m.type === 'image');
    if (!hasImages) return 'Please add at least one image';
    
    return '';
  };
  
  // Save product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    
    setIsSaving(true);
    setSaveError('');
    
    try {
      // Get admin token for authorization
      const token = getAdminToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Prepare form data
      const formData = new FormData();
      
      // Add basic product info
      const productInfo = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        comparePrice: productData.discountPrice,
        category: productData.category,
        gender: productData.gender,
        volume: productData.volume,
        about: productData.about,
        disclaimer: productData.disclaimer,
        featured: productData.featured,
        new_arrival: productData.category.includes('New Arrival'),
        best_seller: productData.category.includes('Bestseller'),
        in_stock: productData.inStock,
        quantity: productData.quantity,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name
        sku: `SKU-${Date.now().toString().slice(-8)}`, // Generate a unique SKU
        media: productData.media // Include all media items
      };
      
      // Add product info as JSON
      formData.append('productInfo', JSON.stringify(productInfo));
      
      // Set mainImage to the first image if available
      const firstImage = productData.media.find(m => m.type === 'image');
      if (firstImage) {
        formData.append('mainImage', firstImage.url);
      }
      
      // Make API call to save product
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        router.push('/admin/products'); // Redirect to products list after success
      }, 1500);
      
    } catch (error: any) {
      console.error('Error saving product:', error);
      setSaveError(error.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Render the page inside the AdminLayout component
  return (
    <AdminLayout activeRoute="/admin/products">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600">Create a new perfume product</p>
            </div>
            <Link 
              href="/admin/products" 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Back to Products
            </Link>
          </div>
          
          {/* Success/Error Messages */}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              Product saved successfully!
            </div>
          )}
          
          {saveError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {saveError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Basic Details */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium mb-4">Basic Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={productData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={productData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
                
                {/* Volume */}
                <div>
                  <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">
                    Volume <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="volume"
                    name="volume"
                    value={productData.volume}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select volume</option>
                    {volumeOptions.map(volume => (
                      <option key={volume} value={volume}>{volume}</option>
                    ))}
                  </select>
                </div>
                
                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={productData.price}
                    onChange={handleNumberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                {/* Discount Price */}
                <div>
                  <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Price (₹) <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    id="discountPrice"
                    name="discountPrice"
                    value={productData.discountPrice || ''}
                    onChange={handleNumberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                
                {/* Categories */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {categoryOptions.map(category => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={productData.category.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Status */}
                <div className="col-span-2 flex space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={productData.featured}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      Featured Product
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inStock"
                      name="inStock"
                      checked={productData.inStock}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                      In Stock
                    </label>
                  </div>
                </div>

              {/* Quantity Field */}
              <div className="col-span-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={productData.quantity}
                  onChange={handleNumberChange}
                  disabled={!productData.inStock}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !productData.inStock ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  min="0"
                  step="1"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  {productData.inStock ? 'Enter the available stock quantity' : 'Enable "In Stock" to set quantity'}
                </p>
              </div>
              </div>
            </div>
            
            {/* Description & Content */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium mb-4">Description & Content</h2>
              
              <div className="space-y-6">
                {/* Short Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={productData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the product"
                    required
                  ></textarea>
                </div>
                
                {/* About */}
                <div>
                  <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
                    About This Fragrance <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    value={productData.about}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed information about the fragrance, notes, etc."
                    required
                  ></textarea>
                </div>
                
                {/* Disclaimer */}
                <div>
                  <label htmlFor="disclaimer" className="block text-sm font-medium text-gray-700 mb-1">
                    Disclaimer <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="disclaimer"
                    name="disclaimer"
                    value={productData.disclaimer}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any disclaimers or warnings about the product"
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Media Upload */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium mb-4">Product Media</h2>
              <p className="text-sm text-gray-500 mb-4">
                Add images and videos of your product. First media item will be used as the featured image. 
                You can reorder media using the up and down arrows.
              </p>
              
              {/* Media Actions */}
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FiImage className="mr-2" /> Upload Images
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FiVideo className="mr-2" /> Upload Videos
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={handleVideoUpload}
                />
              </div>
              
              {/* Media Preview */}
              {productData.media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {productData.media.map((media, index) => (
                    <div key={media.id} className="relative border border-gray-200 rounded-md overflow-hidden">
                      {media.type === 'image' ? (
                        <img src={media.preview} alt="Product" className="w-full h-32 object-cover" />
                      ) : (
                        <video src={media.preview} className="w-full h-32 object-cover" />
                      )}
                      
                      {/* Order indicator */}
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      
                      {/* Controls */}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button 
                          type="button" 
                          onClick={() => handleDeleteMedia(media.id)} 
                          className="bg-red-500 p-1 rounded-full text-white hover:bg-red-600"
                          title="Delete"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                      
                      {/* Reorder controls */}
                      <div className="absolute bottom-2 right-2 flex flex-col space-y-1">
                        <button 
                          type="button" 
                          onClick={() => handleMoveUp(index)} 
                          disabled={index === 0}
                          className={`bg-gray-800 p-1 rounded-full text-white 
                            ${index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-900'}`}
                          title="Move up"
                        >
                          <FiArrowUp size={14} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleMoveDown(index)} 
                          disabled={index === productData.media.length - 1}
                          className={`bg-gray-800 p-1 rounded-full text-white 
                            ${index === productData.media.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-900'}`}
                          title="Move down"
                        >
                          <FiArrowDown size={14} />
                        </button>
                      </div>
                      
                      {/* Media type indicator */}
                      <div className="absolute bottom-2 left-2">
                        {media.type === 'image' ? 
                          <FiImage className="text-white drop-shadow-lg" /> : 
                          <FiVideo className="text-white drop-shadow-lg" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-12 text-center">
                  <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No media uploaded yet</p>
                  <p className="text-xs text-gray-400">Upload images and videos to showcase your product</p>
                </div>
              )}
            </div>
            
            {/* Form Actions */}
            <div className="p-6 bg-gray-50 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
                onClick={() => router.push('/admin/products')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FiSave className="mr-2" /> Save Product
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
    </AdminLayout>
  );
} 