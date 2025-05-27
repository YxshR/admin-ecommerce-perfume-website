'use client';

import React, { useState } from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import { useAuth } from './AuthProvider';

// Custom event for cart updates
export const triggerMiniCartOpen = () => {
  // Create and dispatch a custom event that Nav.tsx can listen for
  const event = new CustomEvent('openMiniCart');
  window.dispatchEvent(event);
};

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  className?: string;
  showIcon?: boolean;
  quantity?: number;
}

export default function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage,
  className = '',
  showIcon = true,
  quantity = 1
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    try {
      if (isAuthenticated) {
        // For authenticated users, first try server API
        try {
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
              productId,
              quantity
            }),
            credentials: 'include'
          });
          
          // Check if response is OK first
          if (response.ok) {
            try {
              const responseData = await response.json();
              
              if (responseData?.success) {
                // Server-side cart update successful
                console.log("Successfully added to server cart");
                
                // Also update localStorage for UI consistency
                addToLocalStorageCart(false); // false = don't show alert
                
                // Show mini cart
                triggerMiniCartOpen();
                return;
              }
            } catch (parseError) {
              console.error("Failed to parse response as JSON:", parseError);
            }
          } else {
            // Handle non-OK responses
            const status = response.status;
            let errorText = "";
            
            try {
              const responseText = await response.text();
              console.log(`Server error response (${status}):`, responseText);
              
              try {
                const errorData = JSON.parse(responseText);
                errorText = errorData.error || "Unknown error";
              } catch (e) {
                errorText = responseText;
              }
            } catch (textError) {
              console.error("Could not read error response text:", textError);
            }
            
            console.error(`Server cart update failed (${status}):`, errorText);
            
            // Check if it's an authentication error
            if (status === 401 || errorText.includes("Unauthorized") || errorText.includes("log in")) {
              console.log("Authentication error, falling back to localStorage cart");
              // No need to show error to user, just add to localStorage instead
            } else {
              // For other errors, log but continue to localStorage fallback
              console.error("Non-authentication server error, falling back to localStorage cart");
            }
          }
          
          // If we reached here, something went wrong with the server request
          // Fall back to localStorage
        } catch (serverError) {
          console.error('Error adding to server cart:', serverError);
        }
      }
      
      // For non-authenticated users or if server update failed
      addToLocalStorageCart(true); // true = show alert
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      // Reset loading state after a short delay to show the animation
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  };
  
  // Helper function to add item to localStorage cart
  const addToLocalStorageCart = (showMiniCart = true) => {
    try {
      // Get existing cart or initialize empty array
      let savedCart = '[]';
      try {
        savedCart = localStorage.getItem('cart') || '[]';
      } catch (storageError) {
        console.error('Error accessing localStorage:', storageError);
      }
      
      let cart = [];
      try {
        cart = JSON.parse(savedCart);
        if (!Array.isArray(cart)) {
          console.error('Cart is not an array, resetting');
          cart = [];
        }
      } catch (parseError) {
        console.error('Error parsing cart:', parseError);
        cart = [];
      }
      
      // Check if product is already in cart
      const existingItemIndex = cart.findIndex((item: any) => item.id === productId);
      
      if (existingItemIndex >= 0) {
        // If product exists, increase quantity by the requested amount
        cart[existingItemIndex].quantity += quantity;
      } else {
        // Otherwise add new item
        cart.push({
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
          quantity
        });
      }
      
      // Save updated cart
      try {
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Force UI update across components by manually triggering storage event
        try {
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'cart',
            newValue: JSON.stringify(cart),
            storageArea: localStorage
          }));
        } catch (eventError) {
          console.error('Error dispatching storage event:', eventError);
        }
        
        // Also update a timestamp to force refresh
        localStorage.setItem('cart_updated', Date.now().toString());
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
      }
      
      // Show mini cart if requested
      if (showMiniCart) {
        triggerMiniCartOpen();
      }
    } catch (error) {
      console.error('Error adding to localStorage cart:', error);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`${className} relative overflow-hidden flex items-center justify-center`}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding...
        </span>
      ) : (
        <>
          {showIcon && <FiShoppingBag className="mr-2" />}
          Add to Cart
        </>
      )}
    </button>
  );
} 