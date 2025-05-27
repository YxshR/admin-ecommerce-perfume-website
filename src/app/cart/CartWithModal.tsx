'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiShoppingBag, FiPlus, FiMinus } from 'react-icons/fi';
import { useAuth } from '../components/AuthProvider';
import CheckoutModal from '../components/CheckoutModal';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartWithModal() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const { isAuthenticated } = useAuth();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Fetch cart items from API
  const fetchCart = async () => {
    try {
      setLoading(true);
      
      // For authenticated users, prioritize server cart
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/cart', {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.cart && Array.isArray(data.cart.items) && data.cart.items.length > 0) {
              setCartItems(data.cart.items);
              setSubtotal(data.cart.subtotal || 0);
              setLoading(false);
              return;
            }
          }
        } catch (serverError) {
          console.error('Error fetching server cart:', serverError);
        }
      }
      
      // For non-authenticated users or if server cart is empty/fails
      const savedCart = localStorage.getItem('cart') || '[]';
      let parsedCart = [];
      
      try {
        parsedCart = JSON.parse(savedCart);
        if (!Array.isArray(parsedCart)) {
          console.error('Cart data is not an array:', parsedCart);
          parsedCart = [];
        }
      } catch (parseError) {
        console.error('Error parsing cart data:', parseError);
        parsedCart = [];
      }
      
      setCartItems(parsedCart);
      
      // Calculate subtotal
      const total = parsedCart.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
      
    } catch (error) {
      console.error('Error in fetchCart:', error);
      setCartItems([]);
      setSubtotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial cart fetch
    fetchCart();
    
    // Add event listener for storage events (when cart is updated in another tab or component)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cart' || event.key === 'cart_updated' || event.key === null) {
        console.log('Storage event detected, refreshing cart');
        fetchCart();
      }
    };
    
    // Add event listener for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for direct localStorage changes
    let lastCartUpdate = localStorage.getItem('cart_updated');
    
    const checkCartUpdates = setInterval(() => {
      const currentCartUpdate = localStorage.getItem('cart_updated');
      if (currentCartUpdate !== lastCartUpdate) {
        console.log('Cart update detected via timestamp');
        lastCartUpdate = currentCartUpdate;
        fetchCart();
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkCartUpdates);
    };
  }, [isAuthenticated]);

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      if (isAuthenticated) {
        // Update cart in database for authenticated users
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({ productId: id, quantity: newQuantity }),
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            setCartItems(data.cart.items);
            setSubtotal(data.cart.subtotal);
            
            // Also update localStorage for UI consistency
            updateLocalStorageCart(id, newQuantity);
            return;
          }
        }
      }
      
      // For non-authenticated users or if server update failed
      updateLocalStorageCart(id, newQuantity);
      
    } catch (error) {
      console.error('Error updating cart:', error);
      // Try localStorage as fallback
      updateLocalStorageCart(id, newQuantity);
    }
  };
  
  // Helper function to update localStorage cart
  const updateLocalStorageCart = (id: string, newQuantity: number) => {
    try {
      const savedCart = localStorage.getItem('cart') || '[]';
      let cart = JSON.parse(savedCart);
      
      if (!Array.isArray(cart)) {
        console.error('Cart is not an array');
        cart = [];
      }
      
      const updatedItems = cart.map((item: any) => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      
      // Update state
      setCartItems(updatedItems);
      
      // Recalculate subtotal
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(updatedItems),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error updating localStorage cart:', error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      if (isAuthenticated) {
        // Remove item from database cart for authenticated users
        const response = await fetch(`/api/cart?productId=${id}`, {
          method: 'DELETE',
          headers: {
            'Cache-Control': 'no-cache'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            setCartItems(data.cart.items);
            setSubtotal(data.cart.subtotal);
            
            // Also update localStorage for UI consistency
            removeLocalStorageItem(id);
            return;
          }
        }
      }
      
      // For non-authenticated users or if server update failed
      removeLocalStorageItem(id);
      
    } catch (error) {
      console.error('Error removing item from cart:', error);
      removeLocalStorageItem(id);
    }
  };
  
  // Helper function to remove item from localStorage
  const removeLocalStorageItem = (id: string) => {
    try {
      const savedCart = localStorage.getItem('cart') || '[]';
      let cart = JSON.parse(savedCart);
      
      if (!Array.isArray(cart)) {
        console.error('Cart is not an array');
        cart = [];
      }
      
      const updatedItems = cart.filter((item: any) => item.id !== id);
      
      // Update state
      setCartItems(updatedItems);
      
      // Recalculate subtotal
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(updatedItems),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error removing item from localStorage cart:', error);
    }
  };

  const openCheckoutModal = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL for non-logged-in users
      window.location.href = '/login?redirect=/cart';
    } else {
      setIsCheckoutModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-medium text-center mb-8">Your Shopping Cart</h1>
      
      {cartItems.length > 0 ? (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart items */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-medium">Product</th>
                      <th className="py-4 px-6 text-left text-sm font-medium">Price</th>
                      <th className="py-4 px-6 text-left text-sm font-medium">Quantity</th>
                      <th className="py-4 px-6 text-left text-sm font-medium">Total</th>
                      <th className="py-4 px-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-16 h-16 flex-shrink-0 overflow-hidden border relative">
                              <Image 
                                src={item.image || '/images/placeholder-product.jpg'} 
                                alt={item.name} 
                                width={64}
                                height={64}
                                className="object-cover"
                                onError={(e) => {
                                  // @ts-ignore - fallback to placeholder on error
                                  e.target.src = '/images/placeholder-product.jpg';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <Link 
                                href={`/product/${item.id}`}
                                className="text-sm font-medium hover:underline"
                              >
                                {item.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm">₹{item.price.toFixed(2)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center border border-gray-300 w-24">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-600 hover:text-black"
                              disabled={item.quantity <= 1}
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="flex-1 text-center text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-600 hover:text-black"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                        <td className="py-4 px-2">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-500 hover:text-red-600"
                            title="Remove item"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <Link 
                href="/collection"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FiShoppingBag className="mr-2" /> Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white shadow-sm border rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-4">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between border-b pb-4">
                  <span>Shipping</span>
                  <span>{subtotal > 500 ? 'Free' : '₹50.00'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-lg font-medium">
                    ₹{(subtotal > 500 ? subtotal : subtotal + 50).toFixed(2)}
                  </span>
                </div>
                
                <button 
                  onClick={openCheckoutModal}
                  className="w-full py-3 bg-black text-white hover:bg-gray-900"
                >
                  Proceed to Checkout
                </button>
                
                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    You'll need to sign in to complete your purchase
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-gray-50">
          <div className="flex justify-center mb-4">
            <FiShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-medium text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added any items to your cart yet
          </p>
          <Link 
            href="/collection" 
            className="px-6 py-3 bg-black text-white inline-block hover:bg-gray-900"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
      />
    </div>
  );
} 