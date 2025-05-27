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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center modal-backdrop">
      <div 
        className="bg-white rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button in top right */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>
        
        {/* Centered Title */}
        <h2 className="text-2xl font-semibold text-center mb-6 pt-2">Phone Verification</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="phone" className="block text-lg mb-3">
              Enter your phone number
            </label>
            
            <div className="flex mb-2">
              <div className="flex items-center justify-center bg-gray-100 px-4 py-3 rounded-l-md border border-r-0 border-gray-300 font-medium">
                <span className="text-gray-700">+91</span>
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
                className={`flex-1 p-3 border rounded-r-md text-lg ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={10}
              />
            </div>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            
            <p className="text-sm text-gray-600 mt-3">
              We'll send you order updates and delivery information on this number
            </p>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-md font-medium w-[48%]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-md font-medium w-[48%]"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 