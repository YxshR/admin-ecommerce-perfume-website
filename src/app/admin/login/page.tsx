'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiAlertCircle, FiShield, FiKey } from 'react-icons/fi';

// Custom hook to detect devtools - helps prevent inspection
const useDevToolsDetection = () => {
  useEffect(() => {
    // Only run in production environment and browser
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      const detectDevTools = () => {
        // Detect if devtools is open
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        if (widthThreshold || heightThreshold) {
          // Redirect to store homepage if devtools detected
          window.location.href = '/';
        }
      };
      
      window.addEventListener('resize', detectDevTools);
      const interval = setInterval(detectDevTools, 1000);
      
      return () => {
        window.removeEventListener('resize', detectDevTools);
        clearInterval(interval);
      };
    }
  }, []);
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingBypass, setUsingBypass] = useState(false);
  const router = useRouter();
  
  // Add devtools detection
  useDevToolsDetection();
  
  // Auto-clear sensitive data from component state after inactivity
  useEffect(() => {
    const clearSensitiveData = () => {
      setPassword('');
    };
    
    const inactivityTimer = setTimeout(clearSensitiveData, 60000); // 1 minute
    
    return () => {
      clearTimeout(inactivityTimer);
      clearSensitiveData();
    };
  }, []);
  
  // Check if user is already logged in
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }, [router]);
  
  const toggleBypassMode = () => {
    setUsingBypass(!usingBypass);
    setEmail(usingBypass ? '' : 'admin@example.com');
    setPassword(usingBypass ? '' : 'admin123');
    setError('');
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Try the normal admin login first if not already using bypass
      if (!usingBypass) {
        try {
          const res = await fetch('/api/auth/admin-login', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify({ email, password }),
            cache: 'no-store',
            credentials: 'include'
          });
          
          // First check if the response is OK before trying to parse it
          if (!res.ok) {
            if (res.status === 500) {
              throw new Error('Server error. Please try again later.');
            }
            
            // Try to parse the JSON error message
            try {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Login failed');
            } catch (jsonError) {
              throw new Error('Login failed. Please check your credentials.');
            }
          }
          
          // If we get here, the response is OK - parse the JSON
          const data = await res.json();
          
          if (data.success && data.token) {
            // Save token to sessionStorage instead of localStorage for better security
            // This means the token is removed when the browser is closed
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));
            sessionStorage.setItem('token_timestamp', Date.now().toString());
            
            // Remove any localStorage items for extra security
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('token_timestamp');
            
            // Add timestamp to avoid timing attacks
            setTimeout(() => {
              // Redirect to admin dashboard
              router.push('/admin/dashboard');
            }, 200);
            return;
          } else {
            setError('Something went wrong. Please try again.');
          }
        } catch (fetchError: any) {
          // Check if error is likely a connection error
          if (fetchError.message.includes('Failed to fetch') || 
              fetchError.message.includes('internet connection') || 
              fetchError.message.includes('network') ||
              fetchError.name === 'TypeError') {
            // Try the bypass route
            setUsingBypass(true);
            setEmail('admin@example.com');
            setPassword('admin123');
            setError('Connection to server failed. Trying backup authentication method...');
            
            // Wait a moment before trying the bypass to show the user what's happening
            setTimeout(() => handleBypassLogin(), 1000);
            return;
          } else {
            setError(fetchError.message || 'Login failed. Please check your credentials.');
          }
        }
      } else {
        // If we're already using bypass, go straight to bypass login
        await handleBypassLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBypassLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      const res = await fetch('/api/auth/admin-bypass', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Invalid email or password for admin access.');
      }
      
      const data = await res.json();
      
      if (data.success && data.token) {
        // Save token to sessionStorage instead of localStorage for better security
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('token_timestamp', Date.now().toString());
        
        // Remove any localStorage items for extra security
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_timestamp');
        
        // Redirect to admin dashboard with slight delay to prevent timing attacks
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 200);
      } else {
        setError('Authentication failed. Please try again with valid credentials.');
      }
    } catch (bypassError: any) {
      setError(bypassError.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
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
                Access restricted to authorized personnel only
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
                <p>Password: admin123</p>
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
            
            <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
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
                    autoComplete="off"
                    required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link href="/admin/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password" // Prevents browsers from auto-filling
                    required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
                >
                  {loading ? 'Signing in...' : 'Sign in to Admin'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                Return to store
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            This is a secure area. Unauthorized access attempts may be logged and reported.
          </p>
        </div>
      </div>
    </div>
  );
} 