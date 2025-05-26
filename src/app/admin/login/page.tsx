'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiAlertCircle, FiShield, FiKey, FiCheckCircle, FiPhone, FiMessageSquare } from 'react-icons/fi';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'method' | 'email' | 'phone' | 'otp'>('method');
  const [usingBypass, setUsingBypass] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email');
  const router = useRouter();
  
  // Toggle between normal login and bypass mode
  const toggleBypassMode = () => {
    setUsingBypass(!usingBypass);
    setEmail(usingBypass ? '' : 'admin@example.com');
    setPhone(usingBypass ? '' : '8126518755');
    setOtp('');
    setError('');
    setSuccess('');
    setStep('method');
  };

  // Handle method selection
  const handleMethodSelect = (method: 'email' | 'sms') => {
    setVerificationMethod(method);
    setStep(method === 'email' ? 'email' : 'phone');
    setError('');
    setSuccess('');
  };
  
  // Handle email submission to request OTP
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your admin email');
      return;
    }

    // Set hardcoded admin email if not entered already
    if (email.toLowerCase() !== 'avitoluxury@gmail.com' && !usingBypass) {
      setEmail('avitoluxury@gmail.com');
      setSuccess('Using default admin email: avitoluxury@gmail.com');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      if (usingBypass) {
        console.log('Using bypass mode with email:', email);
        // Direct login with bypass mode
        setStep('otp');
        setSuccess('OTP verification bypassed. Please enter code: 123456');
        return;
      }
      
      console.log('Requesting OTP for email:', email);
      const res = await fetch('/api/auth/admin-otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        cache: 'no-store'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStep('otp');
        setSuccess('OTP sent to your email address. Please check your inbox.');
      } else {
        setError(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('OTP request error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      
      if (err.message.includes('Failed to fetch') || 
          err.message.includes('internet connection') || 
          err.message.includes('network')) {
        // Switch to bypass mode if there's a connection issue
        setUsingBypass(true);
        setEmail('admin@example.com');
        setStep('otp');
        setSuccess('Using offline mode. Enter code: 123456');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle phone submission to request SMS OTP
  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      setError('Please enter your admin phone number');
      return;
    }

    // Set hardcoded admin phone if not entered already
    if (phone !== '8126518755' && !usingBypass) {
      setPhone('8126518755');
      setSuccess('Using default admin phone: 8126518755');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      if (usingBypass) {
        console.log('Using bypass mode with phone:', phone);
        // Direct login with bypass mode
        setStep('otp');
        setSuccess('OTP verification bypassed. Please enter code: 123456');
        return;
      }
      
      console.log('Requesting SMS OTP for phone:', phone);
      const res = await fetch('/api/auth/admin-otp/generate-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
        cache: 'no-store'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStep('otp');
        setSuccess('OTP sent to your phone number. Please check your messages.');
      } else {
        setError(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('SMS OTP request error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      
      if (err.message.includes('Failed to fetch') || 
          err.message.includes('internet connection') || 
          err.message.includes('network')) {
        // Switch to bypass mode if there's a connection issue
        setUsingBypass(true);
        setPhone('8126518755');
        setStep('otp');
        setSuccess('Using offline mode. Enter code: 123456');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle OTP verification
  const handleOTPSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the OTP sent to your ' + (verificationMethod === 'email' ? 'email' : 'phone'));
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // If using bypass mode, use hardcoded credentials
      if (usingBypass) {
        if ((email === 'admin@example.com' || phone === '8126518755') && otp === '123456') {
          handleBypassLogin();
          return;
        } else {
          setError('Invalid bypass code. Please use 123456.');
          return;
        }
      }
      
      // Verify OTP with API based on verification method
      const endpoint = verificationMethod === 'email' 
        ? '/api/auth/admin-otp/verify'
        : '/api/auth/admin-otp/verify-sms';
        
      const payload = verificationMethod === 'email'
        ? { email, otp }
        : { phone, otp };
        
      const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store'
      });
      
        const data = await res.json();
        
        if (data.success && data.token) {
        // Import and use the new admin auth utility
        const { saveAdminAuth } = await import('@/app/lib/admin-auth');
        
        // Save admin auth data
        saveAdminAuth(data.token, data.user);
          
          // Redirect to admin dashboard
          router.push('/admin/dashboard');
        } else {
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Failed to verify OTP. Please try again.');
      
      if (err.message.includes('Failed to fetch') || 
          err.message.includes('internet connection') || 
          err.message.includes('network')) {
        // Try bypass mode if connection issue
        setUsingBypass(true);
        setEmail('admin@example.com');
        setPhone('8126518755');
        setSuccess('Connection issue detected. Try bypass code: 123456');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle bypass login
  const handleBypassLogin = async () => {
    try {
      console.log('Attempting admin bypass login...');
      setError('');
      
      const res = await fetch('/api/auth/admin-bypass', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error('Admin bypass login failed');
      }
      
      const data = await res.json();
      
      if (data.success && data.token) {
        // Import and use the new admin auth utility
        const { saveAdminAuth } = await import('@/app/lib/admin-auth');
        
        // Save admin auth data
        saveAdminAuth(data.token, data.user);
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Admin bypass login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Admin bypass login error:', err);
      setError(err.message || 'Admin bypass login failed. Please try again.');
    }
  };
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 'method':
  return (
          <div className="space-y-6">
            <p className="text-center text-gray-700 mb-4">Select verification method</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleMethodSelect('email')}
                className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiMail className="h-8 w-8 text-blue-500 mb-2" />
                <span className="font-medium">Email OTP</span>
              </button>
              <button
                onClick={() => handleMethodSelect('sms')}
                className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiMessageSquare className="h-8 w-8 text-green-500 mb-2" />
                <span className="font-medium">SMS OTP</span>
              </button>
            </div>
          </div>
        );
        
      case 'email':
        return (
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
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  'Request Email OTP'
                )}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('method')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Back to Selection
              </button>
            </div>
          </form>
        );
        
      case 'phone':
        return (
          <form className="space-y-6" onSubmit={handlePhoneSubmit}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Admin Phone
                  </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                    required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg"
                  placeholder="8126518755"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 transition-colors duration-200"
                >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  'Request SMS OTP'
                )}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('method')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Back to Selection
                </button>
              </div>
            </form>
        );
        
      case 'otp':
        return (
          <form className="space-y-6" onSubmit={handleOTPSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 text-center text-2xl tracking-widest font-mono border-gray-300 rounded-lg"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                  ${verificationMethod === 'email' 
                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-300' 
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep(verificationMethod === 'email' ? 'email' : 'phone');
                  setOtp('');
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Back to {verificationMethod === 'email' ? 'Email' : 'Phone'}
              </button>
            </div>
          </form>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6">
            <div className="flex items-center justify-center">
              <FiShield className="text-white h-10 w-10" />
              <h1 className="text-white text-2xl font-bold ml-2">Admin Portal</h1>
            </div>
          </div>
          
          <div className="p-8">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrator Login</h2>
              <p className="text-gray-600">
                {step === 'method' && 'Choose your verification method'}
                {step === 'email' && 'Enter your admin email to receive an OTP'}
                {step === 'phone' && 'Enter your admin phone to receive an SMS OTP'}
                {step === 'otp' && `Enter the OTP sent to your ${verificationMethod === 'email' ? 'email' : 'phone'}`}
              </p>
              <button 
                onClick={toggleBypassMode}
                className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                <FiKey className="mr-1" />
                {usingBypass ? "Use Regular Login" : "Use Direct Access"}
              </button>
        </div>
        
            {usingBypass && (
              <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md border border-yellow-200">
                <p className="font-medium">Using direct access mode</p>
                <p>Email: admin@example.com</p>
                <p>Phone: 8126518755</p>
                <p>OTP Code: 123456</p>
              </div>
            )}

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
            
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiCheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 