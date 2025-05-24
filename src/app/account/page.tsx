'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';

// Form sections types
type Section = 'profile' | 'address' | 'security';

// Form data interfaces
interface ProfileData {
  name: string;
  email: string;
  phone: string;
  gender: string;
}

// Interface for address data
interface AddressData {
  addressId?: string;
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

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('profile');
  
  // Form states
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    gender: ''
  });
  
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [editingAddress, setEditingAddress] = useState<AddressData | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Status states
  const [profileStatus, setProfileStatus] = useState({ message: '', isError: false });
  const [addressStatus, setAddressStatus] = useState({ message: '', isError: false });
  const [passwordStatus, setPasswordStatus] = useState({ message: '', isError: false });
  const [verificationStatus, setVerificationStatus] = useState({ message: '', isError: false });
  
  // Loading states
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  
  // Modify the useEffect to fetch addresses
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
      return;
    }

    if (user) {
      // Populate profile data
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: '', // User type doesn't have this property yet
        gender: '' // User type doesn't have this property yet
      });
      
      // Fetch addresses from API
      fetchAddresses();
    }
  }, [user, isAuthenticated, isLoading, router]);
  
  // Handle profile form submit
  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileStatus({ message: '', isError: false });
    
    try {
      // In a real application, this would be an API call to update the user profile
      console.log('Updating profile with data:', profileData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Success message
      setProfileStatus({ 
        message: 'Profile updated successfully!', 
        isError: false 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileStatus({ 
        message: 'Failed to update profile. Please try again.', 
        isError: true 
      });
    } finally {
      setIsProfileLoading(false);
    }
  };
  
  // Handle adding/editing address
  const handleAddressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsAddressLoading(true);
    setAddressStatus({ message: '', isError: false });
    
    try {
      // Check if we have the required fields
      if (!editingAddress) {
        throw new Error('Address data is missing');
      }
      
      if (!editingAddress.fullName || !editingAddress.addressLine1 || 
          !editingAddress.city || !editingAddress.state || 
          !editingAddress.pincode || !editingAddress.country || 
          !editingAddress.phone) {
        throw new Error('Please fill in all required fields');
      }
      
      // If adding a new address
      if (isAddingAddress) {
        const response = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: editingAddress.fullName,
            phone: editingAddress.phone,
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
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add address');
        }
        
        const data = await response.json();
        
        // Add new address to state
        setAddresses([...addresses, data.address]);
      } 
      // If updating an existing address
      else if (editingAddress.addressId) {
        const response = await fetch('/api/user/addresses', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addressId: editingAddress.addressId,
            fullName: editingAddress.fullName,
            phone: editingAddress.phone,
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
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update address');
        }
        
        const data = await response.json();
        
        // Update address in state
        setAddresses(addresses.map(addr => 
          addr.addressId === editingAddress.addressId ? data.address : addr
        ));
      }
      
      // Reset form state
      setEditingAddress(null);
      setIsAddingAddress(false);
      
      // Set success message
      setAddressStatus({ 
        message: isAddingAddress ? 'Address added successfully!' : 'Address updated successfully!', 
        isError: false 
      });
      
      // Fetch updated addresses
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      setAddressStatus({ 
        message: (error as Error).message || 'Failed to save address. Please try again.', 
        isError: true 
      });
    } finally {
      setIsAddressLoading(false);
    }
  };
  
  // Add a fetchAddresses function
  const fetchAddresses = async () => {
    try {
      console.log('Fetching user addresses');
      const response = await fetch('/api/user/addresses', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Address fetch response status:', response.status);
      
      if (!response.ok) {
        // Try to parse error message if it exists
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch addresses: ${response.status}`);
        } catch (jsonError) {
          // If JSON parsing fails, throw generic error with status
          throw new Error(`Failed to fetch addresses: ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log('Address data received:', data.addresses?.length || 0);
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddressStatus({
        message: 'Failed to load addresses. Please refresh the page to try again.',
        isError: true
      });
    }
  };
  
  // Handle address removal
  const handleRemoveAddress = async (addressToRemove: AddressData) => {
    try {
      if (!addressToRemove.addressId) {
        throw new Error('Address ID is missing');
      }
      
      setIsAddressLoading(true);
      
      const response = await fetch(`/api/user/addresses?addressId=${addressToRemove.addressId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete address');
      }
      
      // Remove from state
      setAddresses(addresses.filter(addr => addr.addressId !== addressToRemove.addressId));
      
      setAddressStatus({ 
        message: 'Address removed successfully!', 
        isError: false 
      });
    } catch (error) {
      console.error('Error removing address:', error);
      setAddressStatus({ 
        message: (error as Error).message || 'Failed to remove address. Please try again.', 
        isError: true 
      });
    } finally {
      setIsAddressLoading(false);
    }
  };
  
  // Handle setting default address
  const handleSetDefaultAddress = async (addressToDefault: AddressData) => {
    try {
      if (!addressToDefault.addressId) {
        throw new Error('Address ID is missing');
      }
      
      setIsAddressLoading(true);
      
      const response = await fetch('/api/user/addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...addressToDefault,
          isDefault: true
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update address');
      }
      
      // Update addresses in state
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.addressId === addressToDefault.addressId
      })));
      
      setAddressStatus({ 
        message: 'Default address updated!', 
        isError: false 
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      setAddressStatus({ 
        message: (error as Error).message || 'Failed to update default address. Please try again.', 
        isError: true 
      });
    } finally {
      setIsAddressLoading(false);
    }
  };
  
  // Handle password change
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    setPasswordStatus({ message: '', isError: false });
    
    try {
      // Validation
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      if (passwordData.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // In a real application, this would be an API call to change the password
      console.log('Changing password');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Success message
      setPasswordStatus({ 
        message: 'Password changed successfully!', 
        isError: false 
      });
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordStatus({ 
        message: error.message || 'Failed to change password. Please try again.', 
        isError: true 
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };
  
  // Handle email verification
  const handleSendVerification = async () => {
    setIsVerificationLoading(true);
    setVerificationStatus({ message: '', isError: false });
    
    try {
      // In a real application, this would be an API call to send verification email
      console.log('Sending verification email to:', profileData.email);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Success message
      setVerificationStatus({ 
        message: 'Verification email sent! Please check your inbox.', 
        isError: false 
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      setVerificationStatus({ 
        message: 'Failed to send verification email. Please try again.', 
        isError: true 
      });
    } finally {
      setIsVerificationLoading(false);
    }
  };
  
  // Show loading during authentication check
  if (isLoading) {
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
        <h1 className="text-3xl font-serif font-medium text-center">My Account</h1>
        <div className="w-20 h-1 bg-black mx-auto mt-4"></div>
      </div>
      
      <div className="max-w-6xl mx-auto">
        {/* Account Navigation */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveSection('profile')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeSection === 'profile'
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Profile Information
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection('address')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeSection === 'address'
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Addresses
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection('security')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeSection === 'security'
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Security
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          <div className="md:w-3/4">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-medium">Profile Information</h2>
                  <p className="text-gray-500 text-sm mt-1">Update your personal details</p>
                </div>
                
                <div className="p-6">
                  {profileStatus.message && (
                    <div className={`mb-6 p-3 rounded-lg ${
                      profileStatus.isError
                        ? 'bg-red-50 border border-red-400 text-red-700'
                        : 'bg-green-50 border border-green-400 text-green-700'
                    }`}>
                      {profileStatus.message}
                    </div>
                  )}
                  
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          value={profileData.gender}
                          onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isProfileLoading}
                        className={`px-6 py-2 rounded-md text-white ${
                          isProfileLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-800'
                        }`}
                      >
                        {isProfileLoading ? (
                          <span className="flex items-center justify-center">
                            <span className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></span>
                            Updating...
                          </span>
                        ) : (
                          'Update Profile'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Address Section */}
            {activeSection === 'address' && (
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-medium">My Addresses</h2>
                  <p className="text-gray-500 text-sm mt-1">Manage your delivery addresses</p>
                </div>
                
                <div className="p-6">
                  {addressStatus.message && (
                    <div className={`mb-6 p-3 rounded-lg ${
                      addressStatus.isError
                        ? 'bg-red-50 border border-red-400 text-red-700'
                        : 'bg-green-50 border border-green-400 text-green-700'
                    }`}>
                      {addressStatus.message}
                    </div>
                  )}
                  
                  {!editingAddress && !isAddingAddress ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((address, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                            {address.isDefault && (
                              <span className="absolute top-2 right-2 text-xs bg-black text-white px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                            <p className="font-medium">{address.fullName}</p>
                            <p className="text-sm text-gray-600 mt-1">{address.addressLine1}</p>
                            {address.addressLine2 && <p className="text-sm text-gray-600">{address.addressLine2}</p>}
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.pincode}
                            </p>
                            <p className="text-sm text-gray-600">{address.country}</p>
                            
                            <div className="mt-4 flex space-x-3">
                              <button
                                onClick={() => {
                                  setEditingAddress(address);
                                  setIsAddingAddress(false);
                                }}
                                className="text-sm text-black underline"
                              >
                                Edit
                              </button>
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(address)}
                                  className="text-sm text-black underline"
                                >
                                  Set as Default
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveAddress(address)}
                                className="text-sm text-red-600 underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            setIsAddingAddress(true);
                            setEditingAddress({
                              fullName: '',
                              addressLine1: '',
                              addressLine2: '',
                              city: '',
                              state: '',
                              pincode: '',
                              country: '',
                              phone: '',
                              isDefault: addresses.length === 0
                            });
                          }}
                          className="px-6 py-2 rounded-md text-white bg-black hover:bg-gray-800"
                        >
                          Add New Address
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleAddressSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={editingAddress?.fullName || ''}
                            onChange={(e) => setEditingAddress(editingAddress ? {
                              ...editingAddress,
                              fullName: e.target.value
                            } : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1
                          </label>
                          <input
                            type="text"
                            value={editingAddress?.addressLine1 || ''}
                            onChange={(e) => setEditingAddress(editingAddress ? {
                              ...editingAddress,
                              addressLine1: e.target.value
                            } : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2 (Optional)
                          </label>
                          <input
                            type="text"
                            value={editingAddress?.addressLine2 || ''}
                            onChange={(e) => setEditingAddress(editingAddress ? {
                              ...editingAddress,
                              addressLine2: e.target.value
                            } : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={editingAddress?.city || ''}
                            onChange={(e) => setEditingAddress(editingAddress ? {
                              ...editingAddress,
                              city: e.target.value
                            } : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State/Province
                          </label>
                          <input
                            type="text"
                            value={editingAddress?.state || ''}
                            onChange={(e) => setEditingAddress(editingAddress ? {
                              ...editingAddress,
                              state: e.target.value
                            } : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={editingAddress?.pincode || ''}
                            onChange={(e) => setEditingAddress(editingAddress ? {
                              ...editingAddress,
                              pincode: e.target.value
                            } : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            value={editingAddress?.country || ''}
                            onChange={(e) => setEditingAddress(editingAddress ? {
                              ...editingAddress,
                              country: e.target.value
                            } : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={editingAddress?.phone || ''}
                            onChange={(e) => setEditingAddress(editingAddress ? {
                              ...editingAddress,
                              phone: e.target.value
                            } : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        
                        {addresses.length > 0 && (
                          <div className="md:col-span-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editingAddress?.isDefault || false}
                                onChange={(e) => setEditingAddress(editingAddress ? {
                                  ...editingAddress,
                                  isDefault: e.target.checked
                                } : null)}
                                className="h-4 w-4 border-gray-300 rounded focus:ring-black"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Set as default address
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 flex space-x-3">
                        <button
                          type="submit"
                          disabled={isAddressLoading}
                          className={`px-6 py-2 rounded-md text-white ${
                            isAddressLoading
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-black hover:bg-gray-800'
                          }`}
                        >
                          {isAddressLoading ? (
                            <span className="flex items-center justify-center">
                              <span className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></span>
                              Saving...
                            </span>
                          ) : (
                            'Save Address'
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddress(null);
                            setIsAddingAddress(false);
                          }}
                          className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
            
            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-medium">Security</h2>
                  <p className="text-gray-500 text-sm mt-1">Manage your password and email verification</p>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  
                  {passwordStatus.message && (
                    <div className={`mb-6 p-3 rounded-lg ${
                      passwordStatus.isError
                        ? 'bg-red-50 border border-red-400 text-red-700'
                        : 'bg-green-50 border border-green-400 text-green-700'
                    }`}>
                      {passwordStatus.message}
                    </div>
                  )}
                  
                  <form onSubmit={handlePasswordSubmit} className="mb-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          required
                          minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Password must be at least 6 characters long
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isPasswordLoading}
                        className={`px-6 py-2 rounded-md text-white ${
                          isPasswordLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-800'
                        }`}
                      >
                        {isPasswordLoading ? (
                          <span className="flex items-center justify-center">
                            <span className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></span>
                            Updating...
                          </span>
                        ) : (
                          'Change Password'
                        )}
                      </button>
                    </div>
                  </form>
                  
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-medium mb-4">Email Verification</h3>
                    
                    {verificationStatus.message && (
                      <div className={`mb-6 p-3 rounded-lg ${
                        verificationStatus.isError
                          ? 'bg-red-50 border border-red-400 text-red-700'
                          : 'bg-green-50 border border-green-400 text-green-700'
                      }`}>
                        {verificationStatus.message}
                      </div>
                    )}
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Verify Your Email Address</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {user?.email || 'email@example.com'}
                          </p>
                        </div>
                        <button
                          onClick={handleSendVerification}
                          disabled={isVerificationLoading}
                          className={`px-4 py-2 rounded-md text-white ${
                            isVerificationLoading
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-black hover:bg-gray-800'
                          }`}
                        >
                          {isVerificationLoading ? (
                            <span className="flex items-center justify-center">
                              <span className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></span>
                              Sending...
                            </span>
                          ) : (
                            'Send Verification'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 