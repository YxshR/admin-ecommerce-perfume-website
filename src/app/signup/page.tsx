'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../components/AuthProvider';

// Signal to React to refetch on client-side render for cache busting
const fetchTimestamp = Date.now();

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Check if user is already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/account');
    }
  }, [isAuthenticated, authLoading, router]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess('');
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      // Use relative API URL with cache busting
      const apiUrl = `/api/auth/signup?_=${Date.now()}`;
      
      console.log('Sending signup request to:', apiUrl);
      
      // Call signup API
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache' 
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include', // Important for cookies
        cache: 'no-store'
      });
      
      console.log('Received signup response with status:', res.status);
      
      // Handle fetch errors
      if (!res) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      
      let data;
      try {
        data = await res.json();
        console.log('Signup response data:', data);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      if (!res.ok) {
        console.error('Signup API error:', res.status, data);
        
        // Show specific error message based on the error type
        if (res.status === 500 && data.error?.includes('database')) {
          setError('Our database is temporarily unavailable. Please try again in a few moments.');
        } else if (data.error === 'Email already registered') {
          setError('This email is already registered. Please log in instead.');
        } else {
          setError(data.error || 'Failed to register. Please try again.');
        }
        return;
      }
      
      if (data.success) {
        // Show success message
        setSuccess('Account created successfully! Redirecting to store...');
        
        // Clear form fields
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to store page after a brief delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err: any) {
      console.error('Signup client error:', err);
      
      // Provide more specific error messages based on error type
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to the server. Please make sure the server is running and try again.');
      } else if (err.name === 'SyntaxError') {
        setError('Server returned an invalid response. Please try again later.');
      } else {
        setError(err.message || 'Something went wrong during signup. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-white text-black">
        <div className="w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-white text-black font-sans">
      <div className="hidden md:flex md:w-1/2 bg-cover bg-center bg-[url('https://i.pinimg.com/564x/5f/74/9f/5f749f794a61f04c579e225e48e46b80.jpg')]">
        <div className="w-full h-full bg-gradient-to-r from-black via-black/50 to-transparent flex items-center">
          <div className="px-12 md:px-20 lg:px-28">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 text-white">Join Fraganote</h1>
            <p className="text-lg mb-8 max-w-md text-white">Create an account to explore our exclusive collection of premium fragrances.</p>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold">Create Account</h2>
            <p className="text-gray-600 mt-2">Join the Fraganote community</p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-400 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-400 text-green-700 text-sm rounded-lg">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your Name"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-300 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-black font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-500">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-black hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-black hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 