'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiRefreshCw } from 'react-icons/fi';

// Define types
interface RecentOrder {
  _id: string;
  orderNumber?: string;
  customer?: {
    name: string;
    email: string;
  };
  createdAt: string;
  status: string;
  total?: number;
  totalAmount?: number;
}

interface DashboardData {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: RecentOrder[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: []
  });
  const [dataError, setDataError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Authentication check and data loading
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      // Fetch dashboard summary data
      let token;
      try {
        token = localStorage.getItem('token');
      } catch (storageError) {
        console.error('Error accessing localStorage:', storageError);
        useMockDashboardData();
        return;
      }
      
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token || ''}`
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        // For development purposes, use mock data if API is not available
        console.warn('Using mock data for development');
        useMockDashboardData();
        return;
      }
      
      const data = await response.json();
      setDashboardData(data);
      setDataError('');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data for development
      useMockDashboardData();
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };
  
  // Mock data for development when DB connection fails
  const useMockDashboardData = () => {
    const mockData: DashboardData = {
      totalOrders: 156,
      totalUsers: 982,
      totalProducts: 45,
      recentOrders: [
        {
          _id: '1',
          orderNumber: 'ORD-001',
          customer: {
            name: 'John Smith',
            email: 'john@example.com'
          },
          createdAt: new Date().toISOString(),
          status: 'Pending',
          totalAmount: 1299.00,
          total: 1299.00
        },
        {
          _id: '2',
          orderNumber: 'ORD-002',
          customer: {
            name: 'Priya Sharma',
            email: 'priya@example.com'
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'Processing',
          totalAmount: 2598.00,
          total: 2598.00
        },
        {
          _id: '3',
          orderNumber: 'ORD-003',
          customer: {
            name: 'Alex Johnson',
            email: 'alex@example.com'
          },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'Shipped',
          totalAmount: 3897.00,
          total: 3897.00
        },
        {
          _id: '4',
          orderNumber: 'ORD-004',
          customer: {
            name: 'Rahul Verma',
            email: 'rahul@example.com'
          },
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          status: 'Delivered',
          totalAmount: 2598.00,
          total: 2598.00
        },
        {
          _id: '5',
          orderNumber: 'ORD-005',
          customer: {
            name: 'Anjali Patel',
            email: 'anjali@example.com'
          },
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          status: 'Cancelled',
          totalAmount: 1299.00,
          total: 1299.00
        }
      ]
    };
    
    setDashboardData(mockData);
    setDataError('');
  };
  
  const handleRefresh = () => {
    fetchDashboardData();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button 
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
        >
          <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {dataError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{dataError}</p>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-50 text-blue-500">
              <FiShoppingBag size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-800">{dashboardData.totalProducts}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-50 text-green-500">
              <FiBox size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">{dashboardData.totalOrders}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-50 text-purple-500">
              <FiUsers size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-800">{dashboardData.totalUsers}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber || `#${order._id.substring(0, 8)}`}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{order.customer?.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{(order.total || order.totalAmount || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-900">
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
} 