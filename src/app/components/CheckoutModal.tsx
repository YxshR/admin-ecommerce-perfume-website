'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiX, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import CheckoutProgress from '../checkout/CheckoutProgress';
import OrderSummary from '../checkout/OrderSummary';
import AddressFormModal from '../checkout/AddressFormModal';
import PhoneNumberModal from '../checkout/PhoneNumberModal';
import AddressCard from '../checkout/AddressCard';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Address {
  addressId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'contact' | 'address' | 'payment'>(
    user?.phone ? 'address' : 'contact'
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderInstructions, setOrderInstructions] = useState('');
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if the click is directly on the backdrop (the outermost div)
      if (
        modalRef.current && 
        !modalRef.current.contains(event.target as Node) && 
        (event.target as HTMLElement).classList.contains('modal-backdrop')
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      // If not authenticated, set step to contact
      if (!isAuthenticated) {
        setCurrentStep('contact');
      } else if (user?.phone) {
        setContactPhone(user.phone);
        setCurrentStep('address');
      } else {
        setShowPhoneModal(true);
      }

      // Fetch cart and addresses
      fetchCart();
      if (isAuthenticated) {
        fetchUserAddresses();
      }
    }
  }, [isOpen, isAuthenticated, user]);

  // Function to fetch the cart from API or localStorage
  const fetchCart = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from server first if authenticated
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/cart', {
            credentials: 'include',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.cart && data.cart.items && data.cart.items.length > 0) {
              setCartItems(data.cart.items);
              
              // Calculate prices
              const subtotalAmount = data.cart.subtotal;
              setSubtotal(subtotalAmount);
              
              // Set shipping price (free shipping for orders over 500)
              const shippingAmount = subtotalAmount > 500 ? 0 : 50;
              setShippingPrice(shippingAmount);
              
              setLoading(false);
              return;
            }
          }
        } catch (serverError) {
          console.error('Error fetching server cart:', serverError);
        }
      }
      
      // Fall back to localStorage
      const savedCart = localStorage.getItem('cart') || '[]';
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setCartItems(parsedCart);
          
          // Calculate subtotal
          const subtotalAmount = parsedCart.reduce(
            (sum: number, item: CartItem) => sum + item.price * item.quantity,
            0
          );
          setSubtotal(subtotalAmount);
          
          // Set shipping price (free shipping for orders over 500)
          const shippingAmount = subtotalAmount > 500 ? 0 : 50;
          setShippingPrice(shippingAmount);
        }
      } catch (localStorageError) {
        console.error('Error loading cart from localStorage:', localStorageError);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user addresses
  const fetchUserAddresses = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/user/addresses?_=${timestamp}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && Array.isArray(data.addresses)) {
          setAddresses(data.addresses || []);
        
          // Set default address if available
          const defaultAddress = data.addresses?.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.addressId);
          } else if (data.addresses?.length > 0) {
            setSelectedAddressId(data.addresses[0].addressId);
          }
        } else {
          setIsAddingAddress(true);
        }
      } else {
        console.error('Failed to fetch addresses:', response.status);
        setIsAddingAddress(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setIsAddingAddress(true);
    }
  };

  // Handle adding a new address
  const handleAddAddress = async (newAddress: any) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      // Make sure user is authenticated
      if (!isAuthenticated) {
        setErrorMessage('Please log in to save addresses');
        return;
      }
      
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: newAddress.fullName,
          phone: newAddress.phone,
          addressLine1: newAddress.addressLine1,
          addressLine2: newAddress.addressLine2 || '',
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          isDefault: true
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.address) {
          console.log('Address saved to database successfully:', data.address);
          await fetchUserAddresses();
          setSelectedAddressId(data.address.addressId);
        } else {
          console.error('API returned success:false:', data);
          setErrorMessage(data.error || 'Failed to add address. Please try again.');
        }
      } else {
        const errorData = await response.text();
        console.error('Failed to add address:', response.status, errorData);
        setErrorMessage(`Failed to add address (${response.status}). Please try again.`);
      }
    } catch (error) {
      console.error('Error adding address:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle editing an address
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddingAddress(true);
  };

  // Proceed to payment
  const proceedToPayment = async () => {
    if (!selectedAddressId) {
      setErrorMessage('Please select a delivery address');
      return;
    }
    
    setCurrentStep('payment');
  };

  // Handle confirming phone number
  const handleConfirmPhone = (phone: string) => {
    setContactPhone(phone);
    setShowPhoneModal(false);
    setCurrentStep('address');
  };

  // Process final payment
  const processPayment = async () => {
    if (!selectedAddressId) {
      setErrorMessage('Please select a delivery address');
      return;
    }

    try {
      setProcessingOrder(true);
      setErrorMessage(null);
      
      // Get the selected address
      const selectedAddress = addresses.find(addr => addr.addressId === selectedAddressId);
      if (!selectedAddress) {
        throw new Error('Selected address not found');
      }
      
      const orderData = {
        shippingAddress: {
          fullName: selectedAddress.fullName,
          address: `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2 || ''}`,
          city: selectedAddress.city,
          postalCode: selectedAddress.pincode,
          state: selectedAddress.state,
          country: 'India',
          phone: selectedAddress.phone
        },
        paymentMethod,
        cartItems
      };
      
      // Create the order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Order creation failed:", response.status, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Failed to create order: ${response.status}`);
        } catch (e) {
          throw new Error(`Failed to create order: ${response.status}`);
        }
      }
      
      const data = await response.json();

      if (data.success && data.order) {
        // Clear cart
        localStorage.setItem('cart', '[]');
        localStorage.setItem('cart_updated', Date.now().toString());
        
        // Dispatch storage event to update cart UI across components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'cart',
          newValue: '[]',
          storageArea: localStorage
        }));
        
        const orderId = data.order.orderId || data.order._id;

        // Close modal and redirect to appropriate page
        onClose();
        
        // If using COD, redirect to order confirmation
        if (paymentMethod === 'COD') {
          window.location.href = `/order-confirmation?id=${orderId}`;
        } else {
          // For online payment
          window.location.href = `/payment?orderId=${orderId}`;
        }
      } else {
        throw new Error(data.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Apply discount code
  const applyDiscount = () => {
    // This would typically connect to an API to validate the code
    console.log('Applying discount code:', discountCode);
    // For now, just clear the input
    setDiscountCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto modal-backdrop">
      <div 
        ref={modalRef} 
        className="bg-white w-full max-w-3xl rounded-lg shadow-lg my-8 relative"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating to backdrop
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close modal"
        >
          <FiX size={24} />
        </button>

        {/* Merchant Header */}
        <div className="flex items-center p-4 border-b">
          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden relative mr-3">
            <Image 
              src="/logo.jpg" 
              alt="AVIOTOLUXURY" 
              width={40} 
              height={40}
            />
          </div>
          <div>
            <h2 className="font-medium">AVIOTOLUXURY</h2>
            <div className="flex items-center text-xs text-green-600">
              <span className="bg-green-100 text-green-600 px-1 mr-1 rounded">✓</span>
              Razorpay Trusted Business
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <CheckoutProgress currentStep={currentStep} />

        {/* Content Area */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* Phone Number Section - for contact step */}
          {currentStep === 'contact' && (
            <div className="p-6">
              <h1 className="text-xl font-semibold mb-4">Contact</h1>
              <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-500">+91</span>
                  </div>
                  <span>{contactPhone || 'Add phone number'}</span>
                </div>
                <button 
                  onClick={() => setShowPhoneModal(true)}
                  className="text-blue-600 text-sm"
                >
                  {contactPhone ? 'Edit' : 'Add'}
                </button>
              </div>
              
              <button
                onClick={() => contactPhone ? setCurrentStep('address') : setShowPhoneModal(true)}
                disabled={!contactPhone}
                className={`w-full py-3 rounded-md font-medium ${
                  !contactPhone 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-black text-white'
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Address Section - for address step */}
          {currentStep === 'address' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side - Order summary for address step */}
                <div className="md:order-1 order-2">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b">
                      <h2 className="font-medium">Order summary</h2>
                    </div>
                    <div className="p-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center py-2 border-b">
                          <div className="w-14 h-14 relative flex-shrink-0 mr-3 border">
                            <img 
                              src={item.image || "/images/placeholder-product.jpg"} 
                              alt={item.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-sm font-semibold">
                            ₹{item.price.toFixed(2)}
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-between py-3 border-b">
                        <button 
                          onClick={() => setShowInstructionsModal(true)}
                          className="text-blue-600 text-sm font-medium flex items-center"
                        >
                          {orderInstructions ? 'Edit order instructions' : 'Add order instructions'}
                        </button>
                      </div>
                      
                      {orderInstructions && (
                        <div className="py-2 px-1 text-sm text-gray-600 border-b">
                          <p className="font-medium mb-1">Instructions:</p>
                          <p>{orderInstructions}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between py-3 border-b">
                        <button 
                          onClick={() => {
                            const code = prompt('Enter coupon code:');
                            if (code) {
                              setDiscountCode(code);
                              applyDiscount();
                            }
                          }}
                          className="text-blue-600 text-sm font-medium flex items-center"
                        >
                          {discountCode ? `Applied: ${discountCode}` : 'Add a coupon code'}
                        </button>
                      </div>
                      
                      <div className="pt-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Subtotal</span>
                          <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Shipping</span>
                          <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-3 mt-2">
                          <span>Total</span>
                          <span>₹{(subtotal + shippingPrice).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right side - Address selection */}
                <div className="md:order-2 order-1">
                  <h1 className="text-xl font-semibold mb-4">Add delivery address</h1>
                  
                  {/* Address List */}
                  {addresses.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {addresses.map(address => (
                        <AddressCard
                          key={address.addressId}
                          address={address}
                          isSelected={selectedAddressId === address.addressId}
                          onSelect={setSelectedAddressId}
                          onEdit={handleEditAddress}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Add Address Button */}
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="w-full border border-gray-300 rounded-lg p-4 text-center text-blue-600 hover:bg-gray-50 mb-4"
                  >
                    + Add a new address
                  </button>
                  
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
                      {errorMessage}
                    </div>
                  )}
                  
                  {/* Continue Button */}
                  <button
                    onClick={proceedToPayment}
                    disabled={!selectedAddressId}
                    className={`w-full py-3 rounded-md font-medium ${
                      !selectedAddressId 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-black text-white'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Section - for payment step */}
          {currentStep === 'payment' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h2 className="text-lg font-medium mb-4">Payment Methods</h2>
                  
                  <div className="space-y-3">
                    {/* UPI Option */}
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === 'Online' ? 'border-blue-500' : ''
                      }`}
                      onClick={() => setPaymentMethod('Online')}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            checked={paymentMethod === 'Online'} 
                            onChange={() => setPaymentMethod('Online')}
                            className="mr-3" 
                          />
                          <div className="font-medium">UPI</div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                          <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                          <div className="w-6 h-6 bg-indigo-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cards Option */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">Cards</div>
                        <div className="flex space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                          <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                          <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* EMI Option */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">EMI</div>
                        <div className="flex space-x-2">
                          <div className="w-6 h-6 bg-blue-700 rounded-full"></div>
                          <div className="w-6 h-6 bg-orange-600 rounded-full"></div>
                          <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Netbanking Option */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">Netbanking</div>
                        <div className="flex space-x-2">
                          <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                          <div className="w-6 h-6 bg-blue-700 rounded-full"></div>
                          <div className="w-6 h-6 bg-orange-600 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* COD Option */}
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === 'COD' ? 'border-blue-500' : ''
                      }`}
                      onClick={() => setPaymentMethod('COD')}
                    >
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          checked={paymentMethod === 'COD'} 
                          onChange={() => setPaymentMethod('COD')}
                          className="mr-3" 
                        />
                        <div className="font-medium">Cash on Delivery</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Address Section with Edit Option */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Shipping Address</h2>
                    <button 
                      onClick={() => setCurrentStep('address')}
                      className="text-blue-600 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  
                  {selectedAddressId && addresses.length > 0 && (
                    <div className="border rounded-lg p-4">
                      {addresses.find(addr => addr.addressId === selectedAddressId) && (
                        <div>
                          <p className="font-medium">
                            {addresses.find(addr => addr.addressId === selectedAddressId)?.fullName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {addresses.find(addr => addr.addressId === selectedAddressId)?.addressLine1}
                            {addresses.find(addr => addr.addressId === selectedAddressId)?.addressLine2 ? 
                              `, ${addresses.find(addr => addr.addressId === selectedAddressId)?.addressLine2}` : ''}
                          </p>
                          <p className="text-sm text-gray-600">
                            {addresses.find(addr => addr.addressId === selectedAddressId)?.city}, 
                            {addresses.find(addr => addr.addressId === selectedAddressId)?.state} - 
                            {addresses.find(addr => addr.addressId === selectedAddressId)?.pincode}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Phone: {addresses.find(addr => addr.addressId === selectedAddressId)?.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Order Summary */}
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Order Summary</h3>
                    <div className="border-t border-b py-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
                      </div>
                    </div>
                    <div className="flex justify-between font-medium mt-3">
                      <span>Total</span>
                      <span>₹{(subtotal + shippingPrice).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Controls */}
              <div className="flex justify-between pt-4 border-t">
                <button 
                  onClick={() => setCurrentStep('address')}
                  className="px-4 py-2 border border-gray-300 rounded"
                >
                  Back
                </button>
                <button
                  onClick={processPayment}
                  disabled={processingOrder}
                  className={`px-6 py-2 rounded font-medium ${
                    processingOrder 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-black text-white'
                  }`}
                >
                  {processingOrder ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary - Shown on all steps */}
        <div className="border-t p-4">
          <div className="flex justify-between items-center cursor-pointer mb-2">
            <h3 className="font-medium">Order summary</h3>
            <FiChevronRight />
          </div>
          
          {cartItems.length > 0 && (
            <div>
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center py-2">
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
              
              <div className="flex items-center border-t border-b py-3 my-2">
                <button 
                  className="text-blue-600 text-sm font-medium flex items-center"
                  onClick={() => applyDiscount()}
                >
                  Add a coupon code
                  <FiChevronRight className="ml-1" />
                </button>
              </div>
              
              <div className="flex justify-between font-medium mt-2">
                <span>Total</span>
                <span>₹{(subtotal + shippingPrice).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Phone Number Modal */}
      <PhoneNumberModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onConfirm={handleConfirmPhone}
        initialPhoneNumber={contactPhone}
      />
      
      {/* Address Form Modal */}
      {isAddingAddress && (
        <AddressFormModal
          isOpen={isAddingAddress}
          onClose={() => {
            setIsAddingAddress(false);
            setEditingAddress(null);
          }}
          onAddAddress={handleAddAddress}
        />
      )}
      
      {/* Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center modal-backdrop">
          <div 
            className="bg-white rounded-lg max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium">Order Instructions</h2>
              <button 
                onClick={() => setShowInstructionsModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <textarea
                value={orderInstructions}
                onChange={(e) => setOrderInstructions(e.target.value)}
                placeholder="Add any special instructions for your order here..."
                className="w-full p-3 border border-gray-300 rounded-md h-32"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowInstructionsModal(false);
                }}
                className="px-4 py-2 bg-black text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 