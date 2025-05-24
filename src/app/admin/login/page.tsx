'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiAlertCircle, FiShield, FiKey, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  
  // Handle countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Format countdown as MM:SS
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your admin email');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call the API to verify email and send OTP
      const response = await fetch('/api/auth/admin-verify-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ email }),
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Email verification failed');
      }
      
      if (data.success) {
        // Move to OTP verification step
        setStep(2);
        // Start countdown for 2 minutes (120 seconds)
        setCountdown(120);
      } else {
        throw new Error(data.error || 'Failed to send verification code');
      }
    } catch (err: any) {
      console.error('Email verification error:', err);
      setError(err.message || 'Email verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call the API to verify OTP
      const response = await fetch('/api/auth/admin-verify-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ email, otp }),
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      
      if (data.success) {
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Call the API to resend OTP
      const response = await fetch('/api/auth/admin-verify-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ email }),
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification code');
      }
      
      if (data.success) {
        // Reset OTP field
        setOtp('');
        // Start countdown again
        setCountdown(120);
        setError('');
      } else {
        throw new Error(data.error || 'Failed to resend verification code');
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const goBackToEmail = () => {
    setStep(1);
    setOtp('');
    setError('');
  };
  
  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6">
            <div className="flex items-center justify-center">
              <FiShield className="text-white h-10 w-10" />
              <h1 className="text-white text-2xl font-bold ml-2">AVITO Admin</h1>
            </div>
          </div>
          
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {step === 1 ? 'Admin Authentication' : 'Verify Your Identity'}
              </h2>
              <p className="text-gray-600">
                {step === 1 
                  ? 'Enter your admin email to receive a verification code' 
                  : `Enter the verification code sent to ${email}`}
              </p>
            </div>
            
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {step === 1 ? (
              // Email step
              <form className="space-y-6" onSubmit={handleEmailSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Admin Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg"
                      placeholder="admin@avito.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Only authorized admin emails can access the admin panel
                  </p>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                    {!loading && <FiArrowRight className="ml-2" />}
                  </button>
                </div>
              </form>
            ) : (
              // OTP step
              <form className="space-y-6" onSubmit={handleOtpSubmit}>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 text-center text-xl tracking-widest font-medium border-gray-300 rounded-lg"
                      placeholder="------"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {countdown > 0 
                        ? `Resend available in ${formatCountdown()}`
                        : 'Didn\'t receive the code?'}
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || loading}
                      className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={goBackToEmail}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <FiArrowLeft className="mr-1" />
                    Back to Email
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                Return to store
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            AVITO Admin Portal • Secure Access • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
} 