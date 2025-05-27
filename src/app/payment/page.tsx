'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';
import { FiArrowLeft, FiCreditCard, FiDollarSign, FiShield, FiCheckCircle } from 'react-icons/fi';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface SavedAddress {
  addressId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

type PaymentMethod = 'Credit Card' | 'UPI' | 'COD';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [subtotal, setSubtotal] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [total, setTotal] = useState(0);
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });

  const [upiId, setUpiId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    // Get addresses and cart data
    fetchData();
  }, [isAuthenticated, router, searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Check for address ID in query params
      const addressId = searchParams?.get('addressId');
      if (addressId) {
        await fetchSelectedAddress(addressId);
      } else {
        // For backward compatibility
        const savedShippingAddress = localStorage.getItem('shippingAddress');
        if (savedShippingAddress) {
          setShippingAddress(JSON.parse(savedShippingAddress));
        } else {
          // Instead of redirecting to /checkout, go back to homepage
          router.push('/');
          return;
        }
      }
      
      // Fetch cart from API
      await fetchCart();
    } catch (error) {
      console.error('Error loading data:', error);
      // Instead of redirecting to /checkout, go back to homepage
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedAddress = async (addressId: string) => {
    try {
      const response = await fetch('/api/user/addresses', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const selectedAddress = data.addresses.find(
          (addr: SavedAddress) => addr.addressId === addressId
        );
        
        if (!selectedAddress) {
          throw new Error('Selected address not found');
        }
        
        // Convert to shipping address format
        setShippingAddress({
          fullName: selectedAddress.fullName,
          address: selectedAddress.addressLine1 + (selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''),
          city: selectedAddress.city,
          postalCode: selectedAddress.pincode,
          country: selectedAddress.country,
          phone: selectedAddress.phone,
        });
      } else {
        throw new Error(data.error || 'Failed to fetch address');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include',
        cache: 'no-store',
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
        
        // Calculate prices
        const subtotalAmount = data.cart.subtotal;
        setSubtotal(subtotalAmount);
        
        // Set shipping price (free shipping for orders over 500)
        const shippingAmount = subtotalAmount > 500 ? 0 : 50;
        setShippingPrice(shippingAmount);
        
        // Calculate total
        setTotal(subtotalAmount + shippingAmount);
      } else {
        throw new Error(data.error || 'Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setCardDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };

  const formatExpiryDate = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substring(0, 5);
  };

  const handlePayment = async () => {
    setError('');
    setProcessing(true);
    
    try {
      // Validate payment details based on selected method
      if (paymentMethod === 'Credit Card') {
        if (!cardDetails.cardNumber.replace(/\s/g, '') || 
            !cardDetails.cardholderName || 
            !cardDetails.expiryDate || 
            !cardDetails.cvv) {
          throw new Error('Please fill in all card details');
        }
        
        if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
          throw new Error('Please enter a valid 16-digit card number');
        }
        
        if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
          throw new Error('Please enter a valid expiry date (MM/YY)');
        }
        
        if (!/^\d{3}$/.test(cardDetails.cvv)) {
          throw new Error('Please enter a valid 3-digit CVV');
        }
      } else if (paymentMethod === 'UPI') {
        if (!upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
          throw new Error('Please enter a valid UPI ID');
        }
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order object
      const orderData = {
        user: user?.userId,
        items: cartItems.map(item => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress,
        paymentMethod,
        paymentResult: {
          id: `PAY-${Date.now()}`,
          status: 'Completed',
          update_time: new Date().toISOString(),
        },
        itemsPrice: subtotal,
        shippingPrice,
        taxPrice: 0,
        totalPrice: total,
        isPaid: true,
        paidAt: new Date().toISOString(),
        isDelivered: false,
        status: 'Processing'
      };
      
      // Send order to the API to save in database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });
      
      // Log response status for debugging
      console.log('Order API response status:', response.status);
      
      if (!response.ok) {
        // Handle various response formats
        try {
          const contentType = response.headers.get('content-type');
          console.log('Response content type:', contentType);
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create order');
          } else {
            const errorText = await response.text();
            console.error('Error response text:', errorText);
            throw new Error('Failed to create order');
          }
        } catch (err) {
          console.error('Error parsing response:', err);
          throw new Error('Failed to create order');
        }
      }
      
      // Success - Order created
      const successData = await response.json();
      const orderId = successData.order?._id || 'unknown';
      
      // Clear cart locally after successful order
      // Don't need to clear localStorage anymore since we use DB

      // Redirect to order confirmation
      router.push(`/order-confirmation?id=${orderId}`);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing');
      setProcessing(false);
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
      <div className="mb-8">
        <Link href="/checkout" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <FiArrowLeft className="mr-2" /> Back to Shipping
        </Link>
      </div>

      <h1 className="text-3xl font-medium text-center mb-8">Payment Method</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-7">
          <div className="bg-white shadow-sm border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-medium mb-6">Select Payment Method</h2>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4 flex items-start">
                <input
                  type="radio"
                  id="creditCard"
                  name="paymentMethod"
                  checked={paymentMethod === 'Credit Card'}
                  onChange={() => setPaymentMethod('Credit Card')}
                  className="mt-1"
                />
                <label htmlFor="creditCard" className="ml-3 flex-1">
                  <div className="flex items-center">
                    <FiCreditCard className="text-blue-600 mr-2" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Pay securely with your credit or debit card</p>
                  
                  {paymentMethod === 'Credit Card' && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm mb-1">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            setCardDetails(prev => ({ ...prev, cardNumber: formatted }));
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cardholderName" className="block text-sm mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          id="cardholderName"
                          name="cardholderName"
                          value={cardDetails.cardholderName}
                          onChange={handleCardInputChange}
                          placeholder="John Smith"
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm mb-1">Expiry Date</label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={(e) => {
                              const formatted = formatExpiryDate(e.target.value);
                              setCardDetails(prev => ({ ...prev, expiryDate: formatted }));
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="cvv" className="block text-sm mb-1">CVV</label>
                          <input
                            type="password"
                            id="cvv"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardInputChange}
                            placeholder="123"
                            maxLength={3}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </label>
              </div>
              
              <div className="border rounded-lg p-4 flex items-start">
                <input
                  type="radio"
                  id="upi"
                  name="paymentMethod"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="mt-1"
                />
                <label htmlFor="upi" className="ml-3 flex-1">
                  <div className="flex items-center">
                    <FiDollarSign className="text-green-600 mr-2" />
                    <span className="font-medium">UPI</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Pay using UPI apps like Google Pay, PhonePe, etc.</p>
                  
                  {paymentMethod === 'UPI' && (
                    <div className="mt-4">
                      <label htmlFor="upiId" className="block text-sm mb-1">UPI ID</label>
                      <input
                        type="text"
                        id="upiId"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                </label>
              </div>
              
              <div className="border rounded-lg p-4 flex items-start">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1"
                />
                <label htmlFor="cod" className="ml-3 flex-1">
                  <div className="flex items-center">
                    <FiShield className="text-gray-600 mr-2" />
                    <span className="font-medium">Cash on Delivery</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Pay when you receive your order</p>
                </label>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-sm border rounded-lg p-6">
            <h2 className="text-xl font-medium mb-6">Shipping Address</h2>
            
            {shippingAddress && (
              <div className="text-sm space-y-2">
                <p className="font-medium">{shippingAddress.fullName}</p>
                <p>{shippingAddress.address}</p>
                <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                <p>{shippingAddress.country}</p>
                <p>Phone: {shippingAddress.phone}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-white shadow-sm border rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-medium mb-6">Order Summary</h2>
            
            <div className="space-y-4 divide-y">
              <div className="pb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-2 flex items-center">
                    <div className="w-10 h-10 flex-shrink-0 overflow-hidden border">
                      <img 
                        src={item.image || 'https://placehold.co/200x200'} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="py-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Shipping</span>
                  <span className="text-sm">{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div className="mt-6">
              <button 
                onClick={handlePayment} 
                disabled={processing}
                className={`w-full py-3 bg-black text-white hover:bg-gray-900 flex items-center justify-center ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {processing ? (
                  <>
                    <div className="mr-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="mr-2" /> Place Order
                  </>
                )}
              </button>
            </div>
            
            <p className="text-sm text-gray-500 text-center mt-4">
              By placing your order, you agree to our terms and conditions and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 