'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';
import { FiArrowLeft, FiShoppingBag, FiCheckCircle, FiPlus, FiEdit } from 'react-icons/fi';

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

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [editAddressMode, setEditAddressMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  const [saveAddress, setSaveNewAddress] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    // Fetch cart and addresses
    fetchCart();
    fetchUserAddresses();
    
    // Pre-fill from user data if available
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.name || '',
      }));
    }
  }, [isAuthenticated, router, user]);

  // Function to fetch the cart from API
  const fetchCart = async () => {
    try {
      setLoading(true);
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
        setCartItems([]);
        setSubtotal(0);
        setShippingPrice(0);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
      setSubtotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user addresses
  const fetchUserAddresses = async () => {
    try {
      console.log('Checkout: Fetching user addresses');
      const response = await fetch('/api/user/addresses', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Checkout: Address fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Checkout: Addresses received:', data.addresses?.length || 0);
        setSavedAddresses(data.addresses || []);
        
        // Set default address if available
        const defaultAddress = data.addresses?.find((addr: SavedAddress) => addr.isDefault);
        if (defaultAddress) {
          console.log('Checkout: Setting default address:', defaultAddress.addressId);
          setSelectedAddressId(defaultAddress.addressId);
        } else if (data.addresses?.length > 0) {
          console.log('Checkout: Setting first address as selected');
          setSelectedAddressId(data.addresses[0].addressId);
        } else {
          console.log('Checkout: No addresses found, showing new address form');
          setShowNewAddressForm(true);
        }
      } else {
        console.error('Checkout: Failed to fetch addresses, status:', response.status);
        setShowNewAddressForm(true);
        
        // Try to parse error message for debugging
        try {
          const errorData = await response.json();
          console.error('Checkout: Server error:', errorData.error);
        } catch (jsonError) {
          console.error('Checkout: Could not parse error response');
        }
      }
    } catch (error) {
      console.error('Checkout: Error fetching addresses:', error);
      setShowNewAddressForm(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (showNewAddressForm && editingAddress) {
      // Update the editing address
      setEditingAddress({
        ...editingAddress,
        [name]: value,
      });
    } else {
      // Update the shipping address
      setShippingAddress({
        ...shippingAddress,
        [name]: value,
      });
      
      // Clear error when typing
      if (errors[name as keyof ShippingAddress]) {
        setErrors({
          ...errors,
          [name]: undefined,
        });
      }
    }
  };

  const validateForm = (): boolean => {
    // If using a saved address, no validation needed
    if (selectedAddressId && !showNewAddressForm) {
      return true;
    }
    
    const newErrors: Partial<ShippingAddress> = {};
    let isValid = true;

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!shippingAddress.address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
      isValid = false;
    }

    if (!shippingAddress.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
      isValid = false;
    } else if (!/^\d{6}$/.test(shippingAddress.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 6-digit postal code';
      isValid = false;
    }

    if (!shippingAddress.country.trim()) {
      newErrors.country = 'Country is required';
      isValid = false;
    }

    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(shippingAddress.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSavedAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowNewAddressForm(false);
  };

  const getSelectedAddress = () => {
    return savedAddresses.find(addr => addr.addressId === selectedAddressId);
  };

  const convertSavedAddressToShippingAddress = (savedAddress: SavedAddress): ShippingAddress => {
    return {
      fullName: savedAddress.fullName,
      address: savedAddress.addressLine1 + (savedAddress.addressLine2 ? `, ${savedAddress.addressLine2}` : ''),
      city: savedAddress.city,
      postalCode: savedAddress.pincode,
      country: savedAddress.country,
      phone: savedAddress.phone,
    };
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setEditAddressMode(true);
    setShowNewAddressForm(true);
  };

  const saveEditedAddress = async () => {
    if (!editingAddress) return;

    try {
      setLoading(true);
      const response = await fetch('/api/user/addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingAddress),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      // Refresh addresses
      fetchUserAddresses();
      
      // Reset states
      setEditingAddress(null);
      setEditAddressMode(false);
      setShowNewAddressForm(false);
    } catch (error) {
      console.error('Error updating address:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNewAddressToAccount = async () => {
    if (!editingAddress) return;

    try {
      setLoading(true);
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: editingAddress.fullName,
          phone: editingAddress.phone || '',
          addressLine1: editingAddress.addressLine1,
          addressLine2: editingAddress.addressLine2 || '',
          city: editingAddress.city,
          state: editingAddress.state,
          pincode: editingAddress.pincode,
          country: editingAddress.country,
          isDefault: editingAddress.isDefault
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to create address');
      }

      // Refresh addresses
      fetchUserAddresses();
      
      // Reset states
      setEditingAddress(null);
      setShowNewAddressForm(false);
    } catch (error) {
      console.error('Error creating address:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (method: 'COD' | 'Online') => {
    setPaymentMethod(method);
  };

  const proceedToPayment = async () => {
    // Validate form if using a new address
    if (showNewAddressForm && !validateForm()) {
      return;
    }

    // Either use selected address or create a new one
    const addressToUse = showNewAddressForm 
      ? shippingAddress 
      : convertSavedAddressToShippingAddress(getSelectedAddress() as SavedAddress);

    if (!addressToUse) {
      setErrors({ address: 'Please select or add a shipping address' });
      return;
    }

    setProcessingOrder(true);
    setOrderError(null);

    try {
      // Create the order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: addressToUse,
          paymentMethod,
          saveAddress: showNewAddressForm && saveAddress
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      if (data.success && data.order) {
        setOrderSuccess(true);
        setNewOrderId(data.order.orderId || data.order._id);

        // If using COD, redirect to order confirmation
        if (paymentMethod === 'COD') {
          router.push(`/order-confirmation?id=${data.order.orderId || data.order._id}`);
      } else {
          // For online payment, you would normally redirect to a payment gateway
          // For now, we'll just simulate a successful payment
          setTimeout(() => {
            router.push(`/order-confirmation?id=${data.order.orderId || data.order._id}`);
          }, 2000);
        }
      } else {
        throw new Error('Order creation failed');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderError(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Cancel editing function
  const cancelEditing = () => {
    setEditingAddress(null);
    setEditAddressMode(false);
    setShowNewAddressForm(false);
  };

  // Function to handle adding a new address
  const handleAddNewAddressClick = () => {
    setEditingAddress({
      addressId: '',
      fullName: user?.name || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      phone: '',
      isDefault: savedAddresses.length === 0
    });
    setEditAddressMode(false);
    setShowNewAddressForm(true);
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

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-16 border rounded-lg bg-gray-50">
          <div className="flex justify-center mb-4">
            <FiShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-medium text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            You need to add items to your cart before checkout
          </p>
          <Link 
            href="/cart" 
            className="px-6 py-3 bg-black text-white inline-block hover:bg-gray-900"
          >
            Go to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">Checkout</h1>

      {/* Order Summary and Shipping Address */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Left Column - Shipping Address */}
        <div className="lg:col-span-8 mb-8 lg:mb-0">
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden mb-6">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-medium">Shipping Address</h2>
            </div>
            
            {/* Saved Addresses */}
            {!showNewAddressForm && savedAddresses.length > 0 && (
              <div className="p-6">
                <div className="space-y-4">
                  {savedAddresses.map((address) => (
                    <div 
                      key={address.addressId}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedAddressId === address.addressId ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleSavedAddressSelect(address.addressId)}
                    >
                      <div className="flex justify-between">
                      <div className="flex items-start">
                        <input 
                          type="radio"
                            checked={selectedAddressId === address.addressId}
                          onChange={() => handleSavedAddressSelect(address.addressId)}
                          className="mt-1 mr-3"
                        />
                          <div>
                          <p className="font-medium">{address.fullName}</p>
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            <p>{address.city}, {address.state} {address.pincode}</p>
                            <p>{address.country}</p>
                            <p className="mt-1">Phone: {address.phone}</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={handleAddNewAddressClick}
                  className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <FiPlus className="mr-1" /> Add a new address
                </button>
              </div>
            )}
            
            {/* New Address Form */}
            {showNewAddressForm && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                      value={shippingAddress.fullName}
                    onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                      name="address"
                      value={shippingAddress.address}
                    onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Street address, apartment, suite, etc."
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                
                  <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Save this address for future orders</span>
                  </label>
                  </div>
                </div>
                
                {!editAddressMode && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FiArrowLeft className="mr-1" /> Back to saved addresses
                  </button>
                )}
                
                {editAddressMode && (
                  <div className="flex mt-4 space-x-4">
                  <button
                    type="button"
                    onClick={cancelEditing}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                  >
                    Cancel
                  </button>
                    <button
                      type="button"
                      onClick={saveEditedAddress}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Save Changes
                    </button>
                </div>
                )}
              </div>
            )}
          </div>
          
          {/* Payment Methods */}
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-medium">Payment Method</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer ${
                    paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handlePaymentMethodChange('COD')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'COD'}
                      onChange={() => handlePaymentMethodChange('COD')}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer ${
                    paymentMethod === 'Online' ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handlePaymentMethodChange('Online')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'Online'}
                      onChange={() => handlePaymentMethodChange('Online')}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Online Payment</p>
                      <p className="text-sm text-gray-600">Pay now using credit/debit card or UPI</p>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-medium">Order Summary</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">{cartItems.length} items in cart</p>
                <div className="max-h-60 overflow-y-auto mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center py-2 border-b">
                      <div className="w-12 h-12 flex-shrink-0 overflow-hidden border mr-3">
                        <img 
                          src={item.image || 'https://placehold.co/100x100'} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 border-b pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shippingPrice > 0 ? `₹${shippingPrice.toFixed(2)}` : 'Free'}</span>
                </div>
              </div>
              
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              
              {orderError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {orderError}
                </div>
              )}
              
                <button 
                type="button"
                  onClick={proceedToPayment} 
                disabled={processingOrder || cartItems.length === 0}
                className={`w-full mt-6 py-3 px-4 bg-blue-600 text-white rounded-md ${
                  processingOrder || cartItems.length === 0 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {processingOrder ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'
                }
                </button>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 