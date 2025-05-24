'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../components/AuthProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  
  // Get redirect URL from query params
  const redirectPath = searchParams.get('redirect');
  
  // Check if user is already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // User is already logged in, redirect
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push('/account');
      }
    }
  }, [isAuthenticated, authLoading, redirectPath, router]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Use the login function from AuthProvider
      const result = await login(email, password, redirectPath || undefined);
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
      // No need to redirect here as the AuthProvider will handle it
      
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-white text-black">
        <div className="w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return null; // Will be redirected by the useEffect
  }
  
  return (
    <div className="flex min-h-screen bg-white text-black font-sans">
      <div className="hidden md:flex md:w-1/2 bg-cover bg-center bg-[url('https://i.pinimg.com/564x/5f/74/9f/5f749f794a61f04c579e225e48e46b80.jpg')]">
        <div className="w-full h-full bg-gradient-to-r from-black via-black/50 to-transparent flex items-center">
          <div className="px-12 md:px-20 lg:px-28">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 text-white">Welcome to Fraganote</h1>
            <p className="text-lg mb-8 max-w-md text-white">Login to explore our exclusive collection of premium fragrances.</p>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold">Sign In</h2>
            <p className="text-gray-600 mt-2">Access your Fraganote account</p>
            {redirectPath === '/cart' && (
              <p className="mt-2 text-black font-medium">Please login to continue with your checkout</p>
            )}
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-400 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-black hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                placeholder="********"
                required
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-black font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-500">
              By logging in, you agree to our{' '}
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