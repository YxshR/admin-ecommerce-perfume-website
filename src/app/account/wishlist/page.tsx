'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiShoppingBag, FiTrash2, FiHeart, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/app/components/AuthProvider';

interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<string[]>([]);
  
  useEffect(() => {
    // If authentication check is complete and user is not authenticated, redirect
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account/wishlist');
      return;
    }
    
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [router, isAuthenticated, authLoading]);
  
  const fetchWishlist = () => {
    try {
      // In a real app, this would call an API to get the user's wishlist
      // For now, using localStorage to simulate the functionality
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistItems(wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const removeFromWishlist = (productId: string) => {
    try {
      const updatedWishlist = wishlistItems.filter(item => item.productId !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setWishlistItems(updatedWishlist);
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };
  
  const addToCart = (item: WishlistItem) => {
    // Get existing cart from localStorage
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
    const existingItemIndex = cart.findIndex((cartItem: any) => cartItem.id === item.productId);
    
    if (existingItemIndex >= 0) {
      // If product exists, increase quantity
      cart[existingItemIndex].quantity += 1;
    } else {
      // Otherwise add new item
      cart.push({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1
      });
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
    
    // Show visual feedback
    setAddedToCart([...addedToCart, item.productId]);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setAddedToCart(addedToCart.filter(id => id !== item.productId));
    }, 2000);
  };

  const moveToCart = (item: WishlistItem) => {
    // First add to cart
    addToCart(item);
    
    // Then remove from wishlist
    setTimeout(() => {
      removeFromWishlist(item.productId);
    }, 500);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Show loading during authentication check
  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }
  
  // Don't render anything if not authenticated (will be redirected)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-center">My Wishlist</h1>
        <div className="w-20 h-1 bg-black mx-auto mt-4"></div>
      </div>
      
      {wishlistItems.length > 0 ? (
        <div className="mt-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-2 text-left">Product</th>
                  <th className="py-4 px-2 text-left">Price</th>
                  <th className="py-4 px-2 text-left">Added On</th>
                  <th className="py-4 px-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.map((item) => (
                  <tr key={item.productId} className="border-b">
                    <td className="py-4 px-2">
                      <Link href={`/product/${item.productId}`} className="flex items-center">
                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden border border-gray-200">
                          <img 
                            src={item.image || 'https://placehold.co/100'} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{item.name}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-2">₹{item.price.toFixed(2)}</td>
                    <td className="py-4 px-2">{formatDate(item.addedAt)}</td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        {addedToCart.includes(item.productId) ? (
                          <span className="text-green-600 flex items-center">
                            <FiCheckCircle className="h-5 w-5 mr-1" /> Added
                          </span>
                        ) : (
                          <>
                            <button 
                              onClick={() => addToCart(item)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Add to cart"
                            >
                              <FiShoppingBag className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => moveToCart(item)}
                              className="px-3 py-1 text-xs bg-black text-white hover:bg-gray-800"
                            >
                              Move to Cart
                            </button>
                            <button 
                              onClick={() => removeFromWishlist(item.productId)}
                              className="text-red-600 hover:text-red-800"
                              title="Remove from wishlist"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-black text-white hover:bg-gray-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <div className="flex justify-center mb-4">
            <FiHeart className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-medium text-gray-700 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">
            Add your favorite items to wishlist to save them for later
          </p>
          <Link 
            href="/" 
            className="px-6 py-3 bg-black text-white inline-block hover:bg-gray-900"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
} 