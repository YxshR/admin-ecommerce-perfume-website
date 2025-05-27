'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiShoppingBag, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../components/AuthProvider';
import AddToCartButton from '../../components/AddToCartButton';
import MiniCartWithModal from '../../components/MiniCartWithModal';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  brand: string;
  mainImage: string;
  images: string[];
  quantity: number;
  attributes?: {
    gender?: string;
    volume?: string;
  };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        
        // Fetch the product from the API
        const response = await fetch(`/api/products/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        
        if (data.success && data.product) {
          setProduct(data.product);
          
          // Check if product is in wishlist
          checkWishlistStatus(data.product._id);
        } else {
          throw new Error('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [params.id]);

  // Check if product is in user's wishlist
  const checkWishlistStatus = (productId: string) => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsWishlisted(wishlist.some((item: any) => item.productId === productId));
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  // Handle toggle wishlist
  const handleToggleWishlist = () => {
    if (!product) return;
    
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      if (isWishlisted) {
        // Remove from wishlist
        const updatedWishlist = wishlist.filter((item: any) => item.productId !== product._id);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        setIsWishlisted(false);
      } else {
        // Add to wishlist
        wishlist.push({
          productId: product._id,
          name: product.name,
          price: product.comparePrice || product.price,
          image: product.mainImage || product.images[0] || '',
          addedAt: new Date().toISOString()
        });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        setIsWishlisted(true);
      }
      
      // Trigger storage event for other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'wishlist',
        newValue: localStorage.getItem('wishlist'),
        storageArea: localStorage
      }));
      
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!product) return;
    
    // Add to cart first
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.comparePrice || product.price,
      image: product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : ''),
      quantity: quantity
    };
    
    // Update localStorage cart
    try {
      const savedCart = localStorage.getItem('cart') || '[]';
      let cart = JSON.parse(savedCart);
      
      if (!Array.isArray(cart)) {
        cart = [];
      }
      
      // Check if item already exists in cart
      const existingItemIndex = cart.findIndex((item: any) => item.id === cartItem.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity = quantity;
      } else {
        // Add new item if it doesn't exist
        cart.push(cartItem);
      }
      
      // Save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('cart_updated', Date.now().toString());
      
      // Trigger storage event for other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(cart),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error updating cart:', error);
    }
    
    // Show mini cart with checkout option
    setMiniCartOpen(true);
  };

  // Function to increment/decrement quantity
  const updateQuantity = (value: number) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 10)) {
      setQuantity(newQuantity);
    }
  };

  // Function to show mini cart
  const showMiniCart = () => {
    setMiniCartOpen(true);
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (product && product.comparePrice && product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Product Not Found</h2>
          <p className="mb-8">{error || "We couldn't find the product you're looking for."}</p>
          <Link href="/collection" className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add MiniCartWithModal component */}
      <MiniCartWithModal isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
      
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 hover:text-black"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 relative overflow-hidden border">
            <Image 
              src={product.images && product.images.length > 0 
                ? product.images[selectedImage] 
                : product.mainImage || '/images/placeholder-product.jpg'
              }
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-auto">
              {product.images.map((image, index) => (
                <button 
                  key={index} 
                  className={`w-20 h-20 border-2 ${selectedImage === index ? 'border-black' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <div className="relative w-full h-full">
                    <Image 
                      src={image} 
                      alt={`${product.name} view ${index + 1}`} 
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          {/* Product Title and Brand */}
          <div>
            <h1 className="text-3xl font-medium text-black">{product.name}</h1>
            <div className="text-sm text-gray-500 mt-1">
              {product.brand || 'AVIOTOLUXURY'} | {product.attributes?.volume || '50ml'} | {product.attributes?.gender || 'Unisex'}
            </div>
          </div>
          
          {/* Price */}
          <div className="flex items-center flex-wrap">
            {product.comparePrice ? (
              <>
                <span className="text-2xl font-medium text-black mr-3">₹{product.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through mr-3">MRP ₹{product.comparePrice.toFixed(2)}</span>
                {getDiscountPercentage() > 0 && <span className="text-sm text-green-700">({getDiscountPercentage()}% OFF)</span>}
              </>
            ) : (
              <span className="text-2xl font-medium text-black">₹{product.price.toFixed(2)}</span>
            )}
          </div>
          
          {/* Stock status */}
          <div>
            {product.quantity > 0 ? (
              <span className="text-sm font-medium text-green-700">In Stock</span>
            ) : (
              <span className="text-sm font-medium text-red-600">Out of Stock</span>
            )}
          </div>
          
          {/* Quantity selector */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex border border-gray-300">
              <button 
                onClick={() => updateQuantity(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center border-r border-gray-300"
              >
                <FiMinus size={16} />
              </button>
              <span className="w-12 h-10 flex items-center justify-center">
                {quantity}
              </span>
              <button 
                onClick={() => updateQuantity(1)}
                disabled={quantity >= (product.quantity || 10)}
                className="w-10 h-10 flex items-center justify-center border-l border-gray-300"
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>
          
          {/* Add to cart and Buy now buttons */}
          <div className="flex space-x-4 mb-6">
            <AddToCartButton
              productId={product._id}
              productName={product.name}
              productPrice={product.price}
              productImage={product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : '')}
              className="flex-1 px-4 py-3 bg-black text-white hover:bg-gray-800 flex items-center justify-center"
            />
            
            <button 
              onClick={handleBuyNow}
              disabled={product.quantity <= 0}
              className="flex-1 px-4 py-3 border border-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>
          
          {/* Wishlist button */}
          <button 
            onClick={handleToggleWishlist}
            className="flex items-center text-gray-600 hover:text-black mb-6"
          >
            <FiHeart className={`mr-2 ${isWishlisted ? 'text-red-500 fill-current' : ''}`} />
            {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>
          
          {/* Description */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {/* Product Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Product Details</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Category</td>
                  <td className="py-2">{product.category}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Brand</td>
                  <td className="py-2">{product.brand || 'AVIOTOLUXURY'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Volume</td>
                  <td className="py-2">{product.attributes?.volume || '50ml'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Gender</td>
                  <td className="py-2">{product.attributes?.gender || 'Unisex'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 