'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiShoppingBag, FiHeart, FiStar } from 'react-icons/fi';
import { useAuth } from '@/app/components/AuthProvider';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  category: string;
  images: { url: string }[];
  rating?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  // Check if product is in wishlist when component loads
  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    } else {
      // For non-authenticated users, use localStorage
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const isInWishlist = wishlist.some((item: any) => item.productId === product._id);
        setIsWishlisted(isInWishlist);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    }
  }, [product._id, isAuthenticated]);
  
  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const isInWishlist = data.wishlist.items.some(
          (item: any) => item.productId === product._id
        );
        setIsWishlisted(isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    
    try {
      if (isAuthenticated) {
        // Use the API for authenticated users
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({
            productId: product._id,
            quantity: 1
          }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to add to cart');
        }
      } else {
        // Use localStorage for non-authenticated users
        let cart = [];
        try {
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            cart = JSON.parse(savedCart);
          }
        } catch (error) {
          console.error('Error parsing cart:', error);
        }
        
        // Check if product is already in cart
        const existingItemIndex = cart.findIndex((item: any) => item.id === product._id);
        
        if (existingItemIndex >= 0) {
          // If product exists, increase quantity
          cart[existingItemIndex].quantity += 1;
        } else {
          // Otherwise add new item
          cart.push({
            id: product._id,
            name: product.name,
            price: product.discountedPrice > 0 ? product.discountedPrice : product.price,
            image: product.images[0]?.url || '',
            quantity: 1
          });
        }
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      // Show animation and then reset
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    }
  };
  
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    try {
      if (isWishlisted) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?productId=${product._id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove from wishlist');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setIsWishlisted(false);
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId: product._id }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to add to wishlist');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setIsWishlisted(true);
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };
  
  const discount = (product.discountedPrice > 0 && product.price > 0)
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) 
    : 0;
  
  // Generate stars for rating
  const renderRatingStars = () => {
    const stars = [];
    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={`star-${i}`} className="w-4 h-4 text-black fill-current" />
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative w-4 h-4">
          <FiStar className="absolute w-4 h-4 text-black fill-current" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          <FiStar className="absolute w-4 h-4 text-gray-300" />
        </div>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FiStar key={`empty-star-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }
    
    return stars;
  };
    
  return (
    <div
      className="h-full flex flex-col premium-card overflow-hidden relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product._id}`} className="block">
        {/* On Sale Tag */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 sale-tag z-10">
            On Sale
          </div>
        )}
        
        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-sm hover:bg-gray-100 transition-colors duration-200 z-10 opacity-0 group-hover:opacity-100"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart className={`h-5 w-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-black'}`} />
        </button>
        
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img 
            src={product.images[0]?.url || 'https://placehold.co/400x500'} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </Link>
      
      {/* Product details */}
      <div className="p-4 text-center flex-grow flex flex-col">
        <Link href={`/product/${product._id}`} className="block flex-grow">
          {/* Category */}
          <div className="text-xs text-gray-500 uppercase mb-1">
            {product.category}
          </div>
          
          {/* Title */}
          <h3 className="text-sm font-medium mb-2 line-clamp-1">
            {product.name}
          </h3>
          
          {/* Product Type */}
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">
            {product.category} | Perfume
          </p>
          
          {/* Price */}
          <div className="flex items-center justify-center mt-auto mb-3">
            {product.discountedPrice > 0 ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-black">₹{product.discountedPrice.toFixed(2)}</span>
                  <span className="text-xs text-gray-500 line-through">MRP ₹{product.price.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <span className="text-sm font-medium text-black">₹{product.price.toFixed(2)}</span>
            )}
          </div>
        </Link>
        
        {/* Add to cart button */}
        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-black text-white hover:bg-[#333] transition-all duration-300"
        >
          <span className="text-xs font-medium uppercase">{isAddingToCart ? 'Added!' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
} 