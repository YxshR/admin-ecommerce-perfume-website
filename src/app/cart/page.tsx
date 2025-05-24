'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiTrash2, FiShoppingBag, FiPlus, FiMinus } from 'react-icons/fi';
import { useAuth } from '../components/AuthProvider';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const { isAuthenticated } = useAuth();

  // Fetch cart items from API
  const fetchCart = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated) {
        // Get cart from localStorage if not authenticated
        const savedCart = localStorage.getItem('cart');
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];
        setCartItems(parsedCart);
        
        // Calculate subtotal
        const total = parsedCart.reduce(
          (sum: number, item: CartItem) => sum + item.price * item.quantity,
          0
        );
        setSubtotal(total);
        setLoading(false);
        return;
      }
      
      // Fetch cart from API for authenticated users
      const response = await fetch('/api/cart', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart.items);
        setSubtotal(data.cart.subtotal);
      } else {
        setCartItems([]);
        setSubtotal(0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
      setSubtotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    if (!isAuthenticated) {
      // Update localStorage cart if not authenticated
      const updatedItems = cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      
      setCartItems(updatedItems);
      
      // Recalculate subtotal
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      return;
    }
    
    try {
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
      
      if (!response.ok) {
        throw new Error('Failed to update cart');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart.items);
        setSubtotal(data.cart.subtotal);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeItem = async (id: string) => {
    if (!isAuthenticated) {
      // Remove from localStorage cart if not authenticated
      const updatedItems = cartItems.filter(item => item.id !== id);
      
      setCartItems(updatedItems);
      
      // Recalculate subtotal
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      return;
    }
    
    try {
      // Remove item from database cart for authenticated users
      const response = await fetch(`/api/cart?productId=${id}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart.items);
        setSubtotal(data.cart.subtotal);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const proceedToCheckout = () => {
    if (isAuthenticated) {
      // Redirect to checkout page for logged-in users
      window.location.href = '/checkout';
    } else {
      // Redirect to login with return URL for non-logged-in users
      window.location.href = '/login?redirect=/checkout';
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
                            <div className="w-16 h-16 flex-shrink-0 overflow-hidden border">
                              <img 
                                src={item.image || 'https://placehold.co/200x200'} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
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
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-lg font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={proceedToCheckout}
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
    </div>
  );
} 