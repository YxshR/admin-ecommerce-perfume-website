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

  const saveNewAddress = async () => {
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

  const proceedToPayment = async () => {
    try {
      if (selectedAddressId && !showNewAddressForm) {
        const selectedAddress = getSelectedAddress();
        if (selectedAddress) {
          // Save shipping address to API
          // Instead of storing in localStorage, we'll pass it to the next page via query params
          router.push(`/payment?addressId=${selectedAddress.addressId}`);
          return;
        }
      }
      
      if (validateForm()) {
        // In a real app, we would save the address to the user's account here
        // and then pass the ID to the payment page
        router.push('/payment');
      } else {
        // Scroll to the first error
        const firstErrorField = document.querySelector('.error-message');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } catch (error) {
      console.error('Error proceeding to payment:', error);
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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/cart" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <FiArrowLeft className="mr-2" /> Back to Cart
        </Link>
      </div>

      <h1 className="text-3xl font-medium text-center mb-8">Checkout</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Shipping Address Form */}
        <div className="lg:col-span-7">
          <div className="bg-white shadow-sm border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-medium mb-6">Shipping Address</h2>
            
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Select a saved address</h3>
                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <div 
                      key={address.addressId}
                      onClick={() => handleSavedAddressSelect(address.addressId)}
                      className={`border rounded-md p-3 cursor-pointer ${
                        selectedAddressId === address.addressId && !showNewAddressForm 
                          ? 'border-black bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <input 
                          type="radio"
                          checked={selectedAddressId === address.addressId && !showNewAddressForm}
                          onChange={() => handleSavedAddressSelect(address.addressId)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-grow">
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-sm text-gray-600">{address.addressLine1}</p>
                          {address.addressLine2 && <p className="text-sm text-gray-600">{address.addressLine2}</p>}
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state}, {address.pincode}
                          </p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                          <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          className="text-gray-500 hover:text-black"
                        >
                          <FiEdit size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div 
                    onClick={handleAddNewAddressClick}
                    className={`border rounded-md p-3 cursor-pointer ${
                      showNewAddressForm && !editAddressMode
                        ? 'border-black bg-gray-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input 
                        type="radio"
                        checked={showNewAddressForm && !editAddressMode}
                        onChange={handleAddNewAddressClick}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <FiPlus className="mr-2" />
                        <span className="font-medium">Add a new address</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* New Address Form or Edit Address Form */}
            {showNewAddressForm && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium mb-3">
                  {editAddressMode ? 'Edit Address' : 'Add New Address'}
                </h3>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={editingAddress?.fullName || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={editingAddress?.phone || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">
                    Address Line 1*
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={editingAddress?.addressLine1 || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Street address, P.O. box, company name"
                  />
                </div>
                
                <div>
                  <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={editingAddress?.addressLine2 || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">
                      City*
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={editingAddress?.city || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter your city"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-1">
                      State/Province*
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={editingAddress?.state || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter your state"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium mb-1">
                      Postal Code*
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={editingAddress?.pincode || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter your postal code"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-1">
                      Country*
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={editingAddress?.country || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingAddress?.isDefault || false}
                      onChange={(e) => {
                        if (editingAddress) {
                          setEditingAddress({
                            ...editingAddress,
                            isDefault: e.target.checked
                          });
                        }
                      }}
                      className="h-4 w-4 border-gray-300 rounded focus:ring-black"
                    />
                    <span className="ml-2 text-sm">Set as default address</span>
                  </label>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={editAddressMode ? saveEditedAddress : saveNewAddress}
                    className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-md"
                  >
                    {editAddressMode ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white shadow-sm border rounded-lg p-6">
            <h2 className="text-xl font-medium mb-6">Order Summary</h2>
            
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 flex items-center">
                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden border">
                    <img 
                      src={item.image || 'https://placehold.co/200x200'} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-white shadow-sm border rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-medium mb-6">Payment Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between pb-4">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between pb-4">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
              </div>
              
              <div className="flex justify-between pt-4 border-t font-medium">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              
              <div className="pt-6">
                <button 
                  onClick={proceedToPayment} 
                  className="w-full py-3 bg-black text-white hover:bg-gray-900 flex items-center justify-center"
                >
                  <FiCheckCircle className="mr-2" /> Proceed to Payment
                </button>
              </div>
              
              <p className="text-sm text-gray-500 text-center mt-4">
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 