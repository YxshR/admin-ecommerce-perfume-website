'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiChevronRight, FiEdit2 } from 'react-icons/fi';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  shippingPrice: number;
  onEditCart?: () => void;
  onApplyDiscount?: (code: string) => void;
}

export default function OrderSummary({
  cartItems,
  subtotal,
  shippingPrice,
  onEditCart,
  onApplyDiscount
}: OrderSummaryProps) {
  const [discountCode, setDiscountCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleApplyDiscount = () => {
    if (onApplyDiscount && discountCode.trim()) {
      onApplyDiscount(discountCode);
    }
  };
  
  const total = subtotal + shippingPrice;
  
  return (
    <div className="border rounded-lg bg-white">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <h3 className="font-medium">Order Summary</h3>
          {onEditCart && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEditCart();
              }}
              className="ml-2 text-blue-600 text-sm"
            >
              <FiEdit2 size={16} />
            </button>
          )}
        </div>
        <FiChevronRight 
          className={`transition-transform ${isExpanded ? 'transform rotate-90' : ''}`} 
        />
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t">
          {/* Cart Items */}
          <div className="space-y-3 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center">
                <div className="w-10 h-10 relative flex-shrink-0 mr-3 border">
                  <Image 
                    src={item.image || "/images/placeholder-product.jpg"} 
                    alt={item.name} 
                    fill
                    sizes="40px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-medium">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          {/* Discount Code */}
          {onApplyDiscount && (
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Discount Code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-grow border p-2 rounded-l"
              />
              <button 
                onClick={handleApplyDiscount}
                className="bg-black text-white px-4 py-2 rounded-r"
              >
                Apply
              </button>
            </div>
          )}
          
          {/* Price Breakdown */}
          <div className="space-y-2 text-sm border-t pt-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-2 border-t">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      
      {!isExpanded && (
        <div className="flex justify-between p-4 border-t">
          <span>Total</span>
          <span className="font-medium">₹{total.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
} 