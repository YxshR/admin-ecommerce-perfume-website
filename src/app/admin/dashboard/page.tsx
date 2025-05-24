'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiLogOut, FiSettings, FiRefreshCw } from 'react-icons/fi';

// Define interfaces for data
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Order {
  _id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface DashboardStats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Order[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: []
  });
  const [dataError, setDataError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Check if user is logged in and has admin role
    checkAdminAuth();
  }, [router]);

  const checkAdminAuth = () => {
    // Check cookies first
    const isLoggedIn = document.cookie
      .split('; ')
      .find(row => row.startsWith('isLoggedIn='));
    
    const userDataCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1];
    
    if (isLoggedIn && userDataCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataCookie));
        
        if (userData.role === 'admin') {
          setIsAdmin(true);
          setUserName(userData.name || userData.email || 'Admin');
          fetchDashboardData();
          return;
        }
      } catch (error) {
        console.error('Error parsing user data from cookie:', error);
      }
    }
    
    // Fallback to localStorage if cookies not available
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      
      setIsAdmin(true);
      setUserName(userData.name || userData.email || 'Admin');
      fetchDashboardData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/admin/login');
    }
  };
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setDataError(null);
    
    try {
      // Fetch dashboard statistics
      const response = await fetch('/api/admin/dashboard-stats', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Error loading dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDataError('Unable to load dashboard data. Please try refreshing.');
      
      // Set some fallback data
      setStats({
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        recentOrders: []
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };
  
  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local storage regardless of API call success
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
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
          <h2 className="text-xl font-bold text-white">AVITO Admin</h2>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {userName}</h1>
            <p className="text-gray-600">Here's an overview of your store</p>
          </div>
          <button 
            onClick={handleRefresh} 
            className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
            disabled={isRefreshing}
          >
            <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
        
        {dataError && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            {dataError}
          </div>
        )}
        
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
              <span className="text-2xl font-bold">{stats.totalOrders}</span>
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
              <span className="text-2xl font-bold">{stats.totalUsers}</span>
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
              <span className="text-2xl font-bold">{stats.totalProducts}</span>
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
          
          {stats.recentOrders.length > 0 ? (
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
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderId || order._id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                          ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${order.status === 'Shipped' ? 'bg-gray-100 text-gray-800' : ''}
                          ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                          ${!order.status ? 'bg-gray-100 text-gray-800' : ''}
                        `}>
                          {order.status || 'Processing'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(order.total || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              No orders found. New orders will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 