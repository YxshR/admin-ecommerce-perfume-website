'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiPackage, 
  FiRefreshCw, 
  FiChevronRight, 
  FiFilter, 
  FiCheck, 
  FiX, 
  FiTruck, 
  FiArchive,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiGrid
} from 'react-icons/fi';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let token;
      try {
        token = localStorage.getItem('token');
        if (!token) {
          router.push('/admin/login');
          return;
        }
      } catch (storageError) {
        console.error('Error accessing localStorage:', storageError);
        useMockOrdersData();
        return;
      }

      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // For development purposes, use mock data if API is not available
        console.warn('Using mock data for development');
        useMockOrdersData();
        return;
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      // Use mock data for development
      useMockOrdersData();
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development when DB connection fails
  const useMockOrdersData = () => {
    const mockOrders = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        customer: {
          id: '101',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+91 98765 43210'
        },
        date: new Date().toISOString(),
        status: 'Pending',
        total: 1299.00,
        items: [
          {
            id: 'p1',
            name: 'Wild Escape 50ML',
            quantity: 1,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Wild+Escape'
          }
        ]
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        customer: {
          id: '102',
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 87654 32109'
        },
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'Processing',
        total: 2598.00,
        items: [
          {
            id: 'p2',
            name: 'Baked Vanilla 50ML',
            quantity: 1,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Baked+Vanilla'
          },
          {
            id: 'p3',
            name: 'Apple Lily 50ML',
            quantity: 1,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Apple+Lily'
          }
        ]
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        customer: {
          id: '103',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          phone: '+91 76543 21098'
        },
        date: new Date(Date.now() - 172800000).toISOString(),
        status: 'Shipped',
        total: 3897.00,
        items: [
          {
            id: 'p4',
            name: 'Lavender Dreams 100ML',
            quantity: 3,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Lavender+Dreams'
          }
        ]
      },
      {
        id: '4',
        orderNumber: 'ORD-004',
        customer: {
          id: '104',
          name: 'Rahul Verma',
          email: 'rahul@example.com',
          phone: '+91 65432 10987'
        },
        date: new Date(Date.now() - 259200000).toISOString(),
        status: 'Delivered',
        total: 2598.00,
        items: [
          {
            id: 'p5',
            name: 'Midnight Noir 50ML',
            quantity: 2,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Midnight+Noir'
          }
        ]
      },
      {
        id: '5',
        orderNumber: 'ORD-005',
        customer: {
          id: '105',
          name: 'Anjali Patel',
          email: 'anjali@example.com',
          phone: '+91 54321 09876'
        },
        date: new Date(Date.now() - 345600000).toISOString(),
        status: 'Cancelled',
        total: 1299.00,
        items: [
          {
            id: 'p6',
            name: 'Citrus Burst 50ML',
            quantity: 1,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Citrus+Burst'
          }
        ]
      }
    ];
    
    setOrders(mockOrders);
    setError('');
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      let token;
      try {
        token = localStorage.getItem('token');
      } catch (storageError) {
        console.error('Error accessing localStorage:', storageError);
        // Update local state since we can't access localStorage
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      if (!response.ok) {
        // For development: update local state even if API fails
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        return;
      }

      // Update the orders state to reflect the change
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      // For development: update local state even if API fails
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    try {
      fetchOrders();
    } catch (err) {
      console.error('Error in orders useEffect:', err);
      useMockOrdersData();
    }
  }, []);

  // Filter orders by status
  const filteredOrders = statusFilter === 'All' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    router.push('/admin/login');
  };

  if (loading && orders.length === 0) {
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
          <Link href="/admin/dashboard" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiBox className="mr-3" /> Dashboard
            </div>
          </Link>
          <Link href="/admin/products" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Products
            </div>
          </Link>
          <Link href="/admin/layout" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiGrid className="mr-3" /> Layout
            </div>
          </Link>
          <Link href="/admin/orders" className="block py-3 px-4 text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 border-l-4 border-blue-600">
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600">View and manage customer orders</p>
          </div>
          <button 
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Status filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiFilter className="mr-2 text-gray-500" />
            <span className="mr-3 font-medium">Filter by status:</span>
            <div className="flex space-x-2">
              {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    statusFilter === status
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders table */}
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <FiRefreshCw className="animate-spin h-5 w-5 text-blue-500" />
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiPackage className="mr-2 text-gray-400" />
                        <span className="font-medium text-gray-900">#{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Status update dropdown */}
                        <div className="relative inline-block text-left">
                          <select
                            disabled={updatingOrderId === order.id}
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="block w-full pl-3 pr-10 py-1 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          {updatingOrderId === order.id && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <FiRefreshCw className="animate-spin h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* View order details */}
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          View
                          <FiChevronRight className="ml-1" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Quick status actions */}
        <div className="mt-6 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => {
                const selectedOrders = filteredOrders.filter(o => o.status === 'Pending');
                if (selectedOrders.length > 0 && confirm(`Mark ${selectedOrders.length} pending orders as Processing?`)) {
                  selectedOrders.forEach(o => updateOrderStatus(o.id, 'Processing'));
                }
              }}
              className="flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              <FiCheck className="mr-2" />
              Process Pending Orders
            </button>
            
            <button 
              onClick={() => {
                const selectedOrders = filteredOrders.filter(o => o.status === 'Processing');
                if (selectedOrders.length > 0 && confirm(`Mark ${selectedOrders.length} processing orders as Shipped?`)) {
                  selectedOrders.forEach(o => updateOrderStatus(o.id, 'Shipped'));
                }
              }}
              className="flex items-center justify-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
            >
              <FiTruck className="mr-2" />
              Ship Processed Orders
            </button>
            
            <button 
              onClick={() => {
                const selectedOrders = filteredOrders.filter(o => o.status === 'Shipped');
                if (selectedOrders.length > 0 && confirm(`Mark ${selectedOrders.length} shipped orders as Delivered?`)) {
                  selectedOrders.forEach(o => updateOrderStatus(o.id, 'Delivered'));
                }
              }}
              className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
            >
              <FiArchive className="mr-2" />
              Mark Orders as Delivered
            </button>
            
            <button 
              onClick={() => {
                const selectedOrders = filteredOrders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
                if (selectedOrders.length > 0 && confirm(`Are you sure you want to cancel ${selectedOrders.length} orders?`)) {
                  selectedOrders.forEach(o => updateOrderStatus(o.id, 'Cancelled'));
                }
              }}
              className="flex items-center justify-center p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
            >
              <FiX className="mr-2" />
              Cancel Selected Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}