'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect if already authenticated as admin
  if (isAuthenticated && isAdmin) {
    router.push('/admin/dashboard');
    return null;
  }

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your admin email');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/admin/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Verification code sent to your email');
        setShowOtpForm(true);
      } else {
        // Always show generic message for security (prevents email enumeration)
        toast.success('If this is an admin email, a verification code has been sent');
        setShowOtpForm(true);
      }
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/admin/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Login successful');
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Verification failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to email form
  const handleBackToEmail = () => {
    setShowOtpForm(false);
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure access for administrators only
          </p>
        </div>
        
        <Toaster position="top-center" />
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {!showOtpForm ? (
          // Step 1: Email form
          <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Admin Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          </form>
        ) : (
          // Step 2: OTP verification form
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div>
              <p className="text-sm text-gray-700 mb-4">
                A verification code has been sent to <span className="font-medium">{email}</span>
              </p>
            </div>
            
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="otp" className="sr-only">Verification Code</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter 6-digit verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackToEmail}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={handleRequestOTP}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Resend code
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Return to website
              </span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 