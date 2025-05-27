'use client';

import React from 'react';
import { FiCheck } from 'react-icons/fi';

interface CheckoutProgressProps {
  currentStep: 'contact' | 'address' | 'payment';
}

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const steps = [
    { id: 'contact', label: 'Contact' },
    { id: 'address', label: 'Address' },
    { id: 'payment', label: 'Payment' }
  ];

  // Find the current step index
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="flex w-full border-b">
      {steps.map((step, index) => {
        // Check if this step is active or completed
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        
        return (
          <div 
            key={step.id} 
            className={`flex-1 py-3 text-center font-medium text-sm border-b-2 ${
              isActive 
                ? 'border-blue-500 text-blue-500' 
                : isCompleted 
                  ? 'border-green-500 text-green-500' 
                  : 'border-transparent text-gray-500'
            }`}
          >
            <div className="flex items-center justify-center">
              {isCompleted ? (
                <FiCheck className="mr-2" />
              ) : (
                <span className={`mr-2 inline-flex items-center justify-center w-5 h-5 rounded-full ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </span>
              )}
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
} 