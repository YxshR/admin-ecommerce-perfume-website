'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiLogOut, FiSettings, FiSave, FiPlusCircle, FiImage, FiVideo, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi';

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
}

export default function AddProductPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
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
    inStock: true
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
    // Check if user is logged in and has admin role
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      
      setIsAdmin(true);
      setUserName(userData.name || 'Admin');
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);
  
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
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newMediaItems: ProductMedia[] = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        type: 'image',
        url: URL.createObjectURL(file),
        file: file,
        preview: URL.createObjectURL(file)
      }));
      
      setProductData(prev => ({
        ...prev,
        media: [...prev.media, ...newMediaItems]
      }));
    }
  };
  
  // Handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newMediaItems: ProductMedia[] = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        type: 'video',
        url: URL.createObjectURL(file),
        file: file,
        preview: URL.createObjectURL(file)
      }));
      
      setProductData(prev => ({
        ...prev,
        media: [...prev.media, ...newMediaItems]
      }));
    }
  };
  
  // Handle media deletion
  const handleDeleteMedia = (id: string) => {
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
    if (productData.media.length === 0) return 'Please add at least one image';
    
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
      // In a real app, this would be an API call to save the product data
      // For now, we'll simulate a successful save
      console.log('Product data to save:', productData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
      // Optionally clear form or redirect
      // setProductData({ ... }); // Reset form
      // router.push('/admin/products'); // Redirect to products list
    } catch (error) {
      console.error('Error saving product:', error);
      setSaveError('Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800">
          <h2 className="text-xl font-bold text-white">Fraganote Admin</h2>
        </div>
        <nav className="mt-6">
          <Link href="/admin/dashboard" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiBox className="mr-3" /> Dashboard
            </div>
          </Link>
          <Link href="/admin/products" className="block py-3 px-4 text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 border-l-4 border-blue-600">
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Products
            </div>
          </Link>
          <Link href="/admin/orders" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Orders
            </div>
          </Link>
          <Link href="/admin/users" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiUsers className="mr-3" /> Users
            </div>
          </Link>
          <Link href="/admin/settings" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiSettings className="mr-3" /> Settings
            </div>
          </Link>
          <Link href="/admin/system" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiSettings className="mr-3" /> System
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full text-left py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900"
          >
            <div className="flex items-center">
              <FiLogOut className="mr-3" /> Logout
            </div>
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
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
      </div>
    </div>
  );
} 