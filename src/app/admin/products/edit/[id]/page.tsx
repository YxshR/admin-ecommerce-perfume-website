'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  comparePrice?: number;
  description: string;
  about: string;
  disclaimer: string;
  media: ProductMedia[];
  featured: boolean;
  inStock: boolean;
  quantity: number;
  sku: string;
  brand: string;
  slug: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  
  const { isAuthenticated, user, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [notFound, setNotFound] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Product form state
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    category: [],
    gender: '',
    volume: '',
    price: 0,
    comparePrice: 0,
    description: '',
    about: '',
    disclaimer: '',
    media: [],
    featured: false,
    inStock: true,
    quantity: 0,
    sku: '',
    brand: '',
    slug: ''
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
  
  // Fetch product data when component mounts
  useEffect(() => {
    if (productId && !authLoading && isAuthenticated) {
      fetchProductData();
    }
  }, [productId, authLoading, isAuthenticated]);
  
  // Function to fetch product data
  const fetchProductData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
        }
        throw new Error(`Failed to fetch product: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.product) {
        const product = data.product;
        
        // Format category as an array if it's a string
        let categoryArray = [];
        if (typeof product.category === 'string') {
          categoryArray = product.category.split(',').map((cat: string) => cat.trim());
        } else if (Array.isArray(product.category)) {
          categoryArray = product.category;
        }
        
        // Transform the product data to match our form state
        setProductData({
          name: product.name || '',
          slug: product.slug || '',
          category: categoryArray,
          gender: product.attributes?.gender || '',
          volume: product.attributes?.volume || '',
          price: product.price || 0,
          comparePrice: product.comparePrice || 0,
          description: product.description || '',
          about: product.attributes?.about || '',
          disclaimer: product.attributes?.disclaimer || '',
          media: product.images ? product.images.map((url: string, index: number) => ({
            id: `existing-${index}`,
            type: 'image',
            url
          })) : [],
          featured: product.featured || false,
          inStock: product.quantity > 0,
          quantity: product.quantity || 0,
          sku: product.sku || '',
          brand: product.brand || 'Fraganote'
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setSaveError('Failed to load product data');
    } finally {
      setLoading(false);
    }
  };
  
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
    
    // If inStock is toggled, update quantity accordingly
    if (name === 'inStock' && !checked) {
      setProductData(prev => ({
        ...prev,
        quantity: 0
      }));
    }
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
    if (e.target.files && e.target.files.length > 0) {
      // Show loading state
      setIsSaving(true);
      
      try {
        const uploadedItems: ProductMedia[] = [];
        
        for (const file of Array.from(e.target.files)) {
          // Create a FormData object for each file
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'perfume_products');
          
          // Upload to Cloudinary via our API
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            uploadedItems.push({
              id: data.public_id,
              type: 'image',
              url: data.url,
              preview: data.url
            });
          }
        }
        
        // Update product data with new media items
        setProductData(prev => ({
          ...prev,
          media: [...prev.media, ...uploadedItems]
        }));
        
      } catch (error) {
        console.error('Error uploading images:', error);
        setSaveError('Failed to upload images. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Show loading state
      setIsSaving(true);
      
      try {
        const uploadedItems: ProductMedia[] = [];
        
        for (const file of Array.from(e.target.files)) {
          // Create a FormData object for each file
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'perfume_videos');
          formData.append('resourceType', 'video');
          
          // Upload to Cloudinary via our API
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            uploadedItems.push({
              id: data.public_id,
              type: 'video',
              url: data.url,
              preview: data.url
            });
          }
        }
        
        // Update product data with new media items
        setProductData(prev => ({
          ...prev,
          media: [...prev.media, ...uploadedItems]
        }));
        
      } catch (error) {
        console.error('Error uploading videos:', error);
        setSaveError('Failed to upload videos. Please try again.');
      } finally {
        setIsSaving(false);
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
          const response = await fetch(`/api/upload/cloudinary?publicId=${encodeURIComponent(id)}`, {
            method: 'DELETE'
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
  
  // Validate form before submission
  const validateForm = (): string => {
    if (!productData.name.trim()) return 'Product name is required';
    if (productData.price <= 0) return 'Price must be greater than 0';
    if (!productData.description.trim()) return 'Description is required';
    if (productData.category.length === 0) return 'Please select at least one category';
    if (!productData.sku.trim()) return 'SKU is required';
    if (productData.inStock && productData.quantity <= 0) return 'Quantity must be greater than 0 for in-stock products';
    
    return ''; // No errors
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const error = validateForm();
    if (error) {
      setSaveError(error);
      return;
    }
    
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    
    try {
      // Create form data for multipart/form-data submission
      const formData = new FormData();
      
      // Prepare the main product info as JSON
      const productInfo = {
        name: productData.name,
        slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
        description: productData.description,
        price: productData.price,
        comparePrice: productData.comparePrice,
        category: productData.category,
        featured: productData.featured,
        isNewProduct: productData.category.includes('New Arrival'),
        quantity: productData.inStock ? productData.quantity : 0,
        sku: productData.sku,
        brand: productData.brand || 'Fraganote',
        gender: productData.gender,
        volume: productData.volume,
        about: productData.about,
        disclaimer: productData.disclaimer,
        mainImage: productData.media.length > 0 ? productData.media[0].url : ''
      };
      
      // Add product info as JSON
      formData.append('productInfo', JSON.stringify(productInfo));
      
      // Add media files
      productData.media.forEach((media, index) => {
        if (media.file) {
          formData.append(`media_${index}`, media.file);
        }
      });
      
      // Get existing image URLs that don't have files (from server)
      const existingImages = productData.media
        .filter(media => !media.file && media.url.startsWith('http'))
        .map(media => media.url);
      
      // Add existing images as JSON
      formData.append('existingImages', JSON.stringify(existingImages));
      
      // Send PUT request to update product
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSaveSuccess(true);
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/admin/products');
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setSaveError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Edit Product</h1>
          <Link href="/admin/products" className="text-blue-600 hover:text-blue-800">
            Back to Products
          </Link>
        </div>
        
        {notFound ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Product not found. It may have been deleted or the ID is invalid.
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Alert messages */}
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-4 rounded">
                Product updated successfully! Redirecting...
              </div>
            )}
            
            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 rounded">
                {saveError}
              </div>
            )}
            
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input 
                    type="text"
                    name="name"
                    value={productData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <input 
                    type="text"
                    name="slug"
                    value={productData.slug}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="product-url-slug"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL-friendly version of name. Leave blank to auto-generate.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input 
                    type="text"
                    name="sku"
                    value={productData.sku}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input 
                    type="text"
                    name="brand"
                    value={productData.brand}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Fraganote"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input 
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleNumberChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compare Price (₹)
                  </label>
                  <input 
                    type="number"
                    name="comparePrice"
                    value={productData.comparePrice || ''}
                    onChange={handleNumberChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 border rounded-md"
                    placeholder="Original price before discount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={productData.gender}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Volume
                  </label>
                  <select
                    name="volume"
                    value={productData.volume}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Volume</option>
                    {volumeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={productData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border rounded-md"
                    required
                  ></textarea>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About Product
                  </label>
                  <textarea
                    name="about"
                    value={productData.about}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border rounded-md"
                    placeholder="Additional product details"
                  ></textarea>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disclaimer
                  </label>
                  <textarea
                    name="disclaimer"
                    value={productData.disclaimer}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border rounded-md"
                    placeholder="Product disclaimer or warnings"
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Categories */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium mb-4">Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categoryOptions.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productData.category.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="mr-2"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Inventory */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium mb-4">Inventory</h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={productData.inStock}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    <span>In Stock</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={productData.quantity}
                    onChange={handleNumberChange}
                    min="0"
                    className="w-full p-2 border rounded-md"
                    disabled={!productData.inStock}
                  />
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={productData.featured}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    <span>Featured Product</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Media */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium mb-4">Product Images</h2>
              
              {/* Existing media */}
              <div className="mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {productData.media.map((item, index) => (
                    <div key={item.id} className="border rounded-md overflow-hidden relative">
                      {item.type === 'image' ? (
                        <img 
                          src={item.preview || item.url} 
                          alt={`Product media ${index}`}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <video 
                          src={item.preview || item.url}
                          className="w-full h-40 object-cover"
                          controls
                        />
                      )}
                      <div className="absolute top-0 right-0 p-1 flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          className="bg-white rounded-full p-1 text-gray-700 hover:text-black"
                          disabled={index === 0}
                        >
                          <FiArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          className="bg-white rounded-full p-1 text-gray-700 hover:text-black"
                          disabled={index === productData.media.length - 1}
                        >
                          <FiArrowDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(item.id)}
                          className="bg-white rounded-full p-1 text-red-500 hover:text-red-700"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
                          Main Image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Upload buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FiImage className="mr-2" /> Add Images
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FiVideo className="mr-2" /> Add Videos
                </button>
              </div>
              
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoUpload}
                accept="video/*"
                multiple
                className="hidden"
              />
            </div>
            
            {/* Submit button */}
            <div className="p-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSaving ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
} 