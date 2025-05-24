'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiLogOut, FiSettings } from 'react-icons/fi';

// Custom hook for security checks
const useAdminSecurity = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    // Security: Function to check for devtools
    const detectDevTools = () => {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        if (widthThreshold || heightThreshold) {
          // Force logout on devtools detection
          handleUnauthorized();
        }
      }
    };
    
    // Security: Check if user is authenticated
    const checkAuth = () => {
      try {
        // First check cookies
        const isLoggedInCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('isLoggedIn='))
          ?.split('=')[1];
        
        // Next check sessionStorage (preferred for admin)
        const token = sessionStorage.getItem('token');
        const user = sessionStorage.getItem('user');
        
        // Fallback to localStorage (legacy)
        const legacyToken = localStorage.getItem('token');
        const legacyUser = localStorage.getItem('user');
        
        // Perform security validation
        let isValid = false;
        let userData = null;
        
        if (token && user && isLoggedInCookie?.startsWith('true')) {
          // Preferred: Use sessionStorage data
          userData = JSON.parse(user);
          if (userData.role === 'admin') {
            isValid = true;
          }
        } else if (legacyToken && legacyUser) {
          // Legacy: Use localStorage data but migrate to sessionStorage
          userData = JSON.parse(legacyUser);
          if (userData.role === 'admin') {
            isValid = true;
            
            // Migrate to sessionStorage for better security
            sessionStorage.setItem('token', legacyToken);
            sessionStorage.setItem('user', legacyUser);
            sessionStorage.setItem('token_timestamp', Date.now().toString());
          }
        }
        
        if (isValid && userData) {
          setIsAuthenticated(true);
          setUserName(userData.name || 'Admin');
        } else {
          handleUnauthorized();
        }
      } catch (error) {
        handleUnauthorized();
      }
    };
    
    const handleUnauthorized = () => {
      // Clear all auth data
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token_timestamp');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear cookies client-side
      document.cookie = 'isLoggedIn=; Path=/; Max-Age=0; SameSite=Lax';
      document.cookie = 'userData=; Path=/; Max-Age=0; SameSite=Lax';
      
      // Redirect to login
      router.push('/admin/login');
    };
    
    // Set up security listeners
    checkAuth();
    window.addEventListener('resize', detectDevTools);
    window.addEventListener('storage', checkAuth);
    const securityInterval = setInterval(checkAuth, 60000); // Re-check auth every minute
    
    // Security: Token expiration check
    const checkTokenExpiration = () => {
      const timestamp = sessionStorage.getItem('token_timestamp') || localStorage.getItem('token_timestamp');
      if (timestamp) {
        const tokenAge = Date.now() - parseInt(timestamp);
        // Expire token after 1 hour of inactivity
        if (tokenAge > 3600000) {
          handleUnauthorized();
        }
      }
    };
    
    const expiryInterval = setInterval(checkTokenExpiration, 60000);
    
    return () => {
      window.removeEventListener('resize', detectDevTools);
      window.removeEventListener('storage', checkAuth);
      clearInterval(securityInterval);
      clearInterval(expiryInterval);
    };
  }, [router]);
  
  return { isAuthenticated, userName };
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, userName } = useAdminSecurity();
  
  // Client-side data masking
  const maskSensitiveData = (data: string) => {
    // For demonstration purposes, show only first character and mask the rest
    if (!data || typeof data !== 'string') return '';
    if (data.length <= 4) return '*'.repeat(data.length);
    return data.slice(0, 2) + '*'.repeat(data.length - 3) + data.slice(-1);
  };
  
  useEffect(() => {
    // If authentication check is complete
    if (isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  const handleLogout = () => {
    // Clear sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token_timestamp');
    
    // Clear localStorage for legacy support
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cookies client-side
    document.cookie = 'isLoggedIn=; Path=/; Max-Age=0; SameSite=Lax';
    document.cookie = 'userData=; Path=/; Max-Age=0; SameSite=Lax';
    
    // Server-side logout to clear HTTP-only cookies
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Cache-Control': 'no-cache' },
      credentials: 'include'
    }).finally(() => {
      router.push('/admin/login');
    });
  };
  
  // Detect page visibility changes for additional security
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Update timestamp when tab/window is not visible
        sessionStorage.setItem('last_visibility_change', Date.now().toString());
      } else {
        // When tab becomes visible, check time elapsed
        const lastChange = sessionStorage.getItem('last_visibility_change');
        if (lastChange) {
          const timeElapsed = Date.now() - parseInt(lastChange);
          // If tab was hidden for more than 30 minutes, log out
          if (timeElapsed > 1800000) {
            handleLogout();
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800">
          <h2 className="text-xl font-bold text-white">Fraganote Admin</h2>
        </div>
        <nav className="mt-6">
          <Link href="/admin/dashboard" className="block py-3 px-4 text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 border-l-4 border-blue-600">
            <div className="flex items-center">
              <FiBox className="mr-3" /> Dashboard
            </div>
          </Link>
          <Link href="/admin/products" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Products
            </div>
          </Link>
          <Link href="/admin/orders" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Orders
            </div>
          </Link>
          <Link href="/admin/users" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiUsers className="mr-3" /> Users
            </div>
          </Link>
          <Link href="/admin/settings" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiSettings className="mr-3" /> Settings
            </div>
          </Link>
          <Link href="/admin/system" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiSettings className="mr-3" /> System
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full text-left py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900"
          >
            <div className="flex items-center">
              <FiLogOut className="mr-3" /> Logout
            </div>
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {userName}</h1>
          <p className="text-gray-600">Here's an overview of your store</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <FiShoppingBag className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="ml-4 text-lg font-medium">Orders</h3>
            </div>
            <div className="flex justify-between">
              <span className="text-2xl font-bold">24</span>
              <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
          </div>
          
          {/* Users Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <FiUsers className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-4 text-lg font-medium">Users</h3>
            </div>
            <div className="flex justify-between">
              <span className="text-2xl font-bold">152</span>
              <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
          </div>
          
          {/* Products Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <FiBox className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="ml-4 text-lg font-medium">Products</h3>
            </div>
            <div className="flex justify-between">
              <span className="text-2xl font-bold">86</span>
              <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
          </div>
        </div>
        
        {/* Recent Orders Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View all orders</Link>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #FRA-001
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {maskSensitiveData("John Smith")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    May 23, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Delivered
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹1,299.00
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #FRA-002
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {maskSensitiveData("Priya Sharma")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    May 22, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹2,598.00
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #FRA-003
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {maskSensitiveData("Rahul Kumar")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    May 21, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Shipped
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹3,149.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 