'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiBox, FiShoppingBag, FiUsers, FiLogOut, FiSettings, FiTruck, FiCalendar, FiCreditCard, FiMapPin, FiUser, FiPackage } from 'react-icons/fi';

// Define the type for order status
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Define the Order interface
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
  status: OrderStatus;
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  shipping: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  payment: {
    method: string;
    transactionId: string;
    status: string;
  };
}

export default function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is logged in and has admin role
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
      
      fetchOrderDetails();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/admin/login');
    }
  }, [orderId, router]);
  
  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // In a real application, you would fetch from your API
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        // For development purposes, use mock data if API is not available
        useMockData();
        return;
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Use mock data for development
      useMockData();
    } finally {
      setLoading(false);
    }
  };
  
  const useMockData = () => {
    // Find the mock order based on the ID from the URL
    const mockOrders = [
      {
        id: '1',
        orderNumber: 'FRA-001',
        customer: {
          id: '101',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+91 98765 43210'
        },
        date: '2023-05-23',
        status: 'delivered' as OrderStatus,
        total: 1299.00,
        items: [
          {
            id: 'p1',
            name: 'Wild Escape 50ML',
            quantity: 1,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Wild+Escape'
          }
        ],
        shipping: {
          address: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India'
        },
        payment: {
          method: 'Credit Card',
          transactionId: 'txn_123456',
          status: 'completed'
        }
      },
      {
        id: '2',
        orderNumber: 'FRA-002',
        customer: {
          id: '102',
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 87654 32109'
        },
        date: '2023-05-22',
        status: 'processing' as OrderStatus,
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
        ],
        shipping: {
          address: '456 Park Ave',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110001',
          country: 'India'
        },
        payment: {
          method: 'UPI',
          transactionId: 'txn_789012',
          status: 'completed'
        }
      }
    ];
    
    const foundOrder = mockOrders.find(o => o.id === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      setError('Order not found');
    }
  };
  
  const updateOrderStatus = async (newStatus: OrderStatus) => {
    try {
      // In a real app, this would call your API
      // await fetch(`/api/orders/${orderId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ orderId, status: newStatus })
      // });
      
      // For now, just update the local state
      if (order) {
        setOrder({
          ...order,
          status: newStatus
        });
      }
      
      console.log(`Status for order ${orderId} updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };
  
  // Order status badge component
  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
      case 'pending':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'processing':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'shipped':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'delivered':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
          <p className="text-gray-700">{error}</p>
          <Link href="/admin/orders" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h3>
          <p className="text-gray-700">The requested order could not be found.</p>
          <Link href="/admin/orders" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Orders
          </Link>
        </div>
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
        <div className="mb-6">
          <Link
            href="/admin/orders"
            className="flex items-center text-blue-600 hover:underline"
          >
            <FiArrowLeft className="mr-1" size={16} /> Back to Orders
          </Link>
        </div>
        
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center text-sm text-gray-500">
                <FiCalendar size={14} className="mr-1" />
                {new Date(order.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div>
              <StatusBadge status={order.status} />
            </div>
            <div>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(e.target.value as OrderStatus)}
                className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Customer Info Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <FiUser className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium">Customer</h3>
            </div>
            <div className="space-y-2">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-sm text-gray-600">{order.customer.email}</p>
              <p className="text-sm text-gray-600">{order.customer.phone}</p>
            </div>
          </div>
          
          {/* Shipping Info Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-full">
                <FiMapPin className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium">Shipping Address</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{order.shipping.address}</p>
              <p className="text-sm text-gray-600">{order.shipping.city}, {order.shipping.state}</p>
              <p className="text-sm text-gray-600">{order.shipping.postalCode}</p>
              <p className="text-sm text-gray-600">{order.shipping.country}</p>
            </div>
          </div>
          
          {/* Payment Info Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-full">
                <FiCreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium">Payment</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Method</p>
                <p className="text-sm font-medium">{order.payment.method}</p>
              </div>
              {order.payment.transactionId && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="text-sm font-medium">{order.payment.transactionId}</p>
                </div>
              )}
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-sm font-medium capitalize">{order.payment.status}</p>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <p className="text-sm font-medium">Total</p>
                <p className="text-lg font-bold">₹{order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-amber-100 p-2 rounded-full">
                <FiPackage className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium">Order Items</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">ID: {item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-base font-bold text-gray-900">
                    ₹{order.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {/* Shipping Timeline */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-full">
                <FiTruck className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium">Order Timeline</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-8">
              <div className="relative flex items-start">
                <div className="flex items-center h-6">
                  <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-green-500 rounded-full">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute top-6 left-3 -ml-px h-full w-0.5 bg-gray-300"></div>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">Order Placed</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-6">
                  <div className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full ${order.status === 'pending' ? 'bg-gray-300' : 'bg-green-500'}`}>
                    {order.status !== 'pending' ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="absolute top-6 left-3 -ml-px h-full w-0.5 bg-gray-300"></div>
                </div>
                <div className="ml-4">
                  <h4 className={`font-medium ${order.status === 'pending' ? 'text-gray-500' : ''}`}>Processing</h4>
                  {order.status !== 'pending' && (
                    <p className="text-sm text-gray-500 mt-1">Order confirmed and being processed</p>
                  )}
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-6">
                  <div className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {(order.status === 'shipped' || order.status === 'delivered') ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="absolute top-6 left-3 -ml-px h-full w-0.5 bg-gray-300"></div>
                </div>
                <div className="ml-4">
                  <h4 className={`font-medium ${order.status === 'shipped' || order.status === 'delivered' ? '' : 'text-gray-500'}`}>Shipped</h4>
                  {(order.status === 'shipped' || order.status === 'delivered') && (
                    <p className="text-sm text-gray-500 mt-1">Your order has been shipped</p>
                  )}
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-6">
                  <div className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {order.status === 'delivered' ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className={`font-medium ${order.status === 'delivered' ? '' : 'text-gray-500'}`}>Delivered</h4>
                  {order.status === 'delivered' && (
                    <p className="text-sm text-gray-500 mt-1">Order has been delivered</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 