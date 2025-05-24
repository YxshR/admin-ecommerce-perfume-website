'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Authentication protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/track-order');
    }
  }, [isAuthenticated, router]);
  
  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setOrderResult(null);
    
    // Simulate tracking API call
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      if (orderNumber && orderEmail) {
        setOrderResult({
          orderNumber: orderNumber,
          placedOn: new Date().toLocaleDateString(),
          status: 'Processing',
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          items: [
            { name: 'Mystic Ocean Perfume', quantity: 1, status: 'Processing' }
          ]
        });
      } else {
        setError('Please enter both order number and email');
      }
      setIsLoading(false);
    }, 1000);
  };
  
  // If not authenticated, don't render the page content
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Track Your Order</h1>
        
        {!orderResult ? (
          <>
            <p className="text-gray-600 mb-8">
              Enter your order number and email address to track your order status.
            </p>
            
            <form onSubmit={handleTrackOrder} className="space-y-6">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., FR0000123"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={orderEmail}
                  onChange={(e) => setOrderEmail(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              {error && (
                <div className="text-red-500">{error}</div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 font-medium hover:bg-gray-800 disabled:bg-gray-400"
              >
                {isLoading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>
          </>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Order #{orderResult.orderNumber}</h2>
                <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  {orderResult.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">Placed on {orderResult.placedOn}</p>
            </div>
            
            <div className="p-4">
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Estimated Delivery</h3>
                <p className="text-lg font-bold">{orderResult.estimatedDelivery}</p>
              </div>
              
              <h3 className="text-sm font-medium mb-3 border-b border-gray-200 pb-2">Order Items</h3>
              
              {orderResult.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">{item.status}</span>
                </div>
              ))}
              
              <div className="mt-6">
                <button 
                  onClick={() => setOrderResult(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Track Another Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 