'use client';

import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface PhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phoneNumber: string) => void;
  initialPhoneNumber?: string;
}

export default function PhoneNumberModal({
  isOpen,
  onClose,
  onConfirm,
  initialPhoneNumber = ''
}: PhoneNumberModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    
    // Check if it's a valid 10-digit phone number
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    // Clear error and confirm
    setError('');
    onConfirm(phoneNumber);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Phone Verification</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="phone" className="block text-sm text-gray-700 mb-2">
              Enter your phone number
            </label>
            <div className="flex">
              <div className="flex items-center bg-gray-100 px-3 rounded-l-md border border-r-0 border-gray-300">
                <span className="text-gray-500">+91</span>
              </div>
              <input
                type="text"
                id="phone"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers
                  if (/^\d*$/.test(value)) {
                    setPhoneNumber(value);
                    setError('');
                  }
                }}
                placeholder="10-digit phone number"
                className={`flex-1 p-3 border rounded-r-md ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={10}
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            <p className="text-xs text-gray-500 mt-2">
              We'll send you order updates and delivery information on this number
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 