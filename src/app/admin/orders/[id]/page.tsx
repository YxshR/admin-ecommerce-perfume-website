'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPackage, FiUser, FiMap, FiCreditCard, FiTruck, FiCalendar, FiShoppingBag, FiRefreshCw } from 'react-icons/fi';

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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch order details
  const fetchOrder = async () => {
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
        useMockOrderData(id);
        return;
      }
      
      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // For development purposes, use mock data if API is not available
        console.warn('Using mock data for development');
        useMockOrderData(id);
        return;
      }
      
      const data = await response.json();
      setOrder(data.order);
      setError('');
    } catch (err) {
      console.error('Error fetching order details:', err);
      // Use mock data for development
      useMockOrderData(id);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development when DB connection fails
  const useMockOrderData = (orderId: string) => {
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
          status: 'pending'
        }
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
        ],
        shipping: {
          address: '789 Lake View',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India'
        },
        payment: {
          method: 'Credit Card',
          transactionId: 'txn_345678',
          status: 'completed'
        }
      }
    ];
    
    const foundOrder = mockOrders.find(o => o.id === orderId);
    
    if (foundOrder) {
      setOrder(foundOrder);
      setError('');
    } else {
      // If the specific order ID is not found, use the first mock order with the requested ID
      setOrder({
        ...mockOrders[0],
        id: orderId,
        orderNumber: `ORD-${orderId}`
      });
      setError('');
    }
  };

  // Update order status
  const updateOrderStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      let token;
      try {
        token = localStorage.getItem('token');
      } catch (storageError) {
        console.error('Error accessing localStorage:', storageError);
        // Update local state since we can't access localStorage
        if (order) {
          setOrder({ ...order, status: newStatus });
        }
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: id, status: newStatus })
      });

      if (!response.ok) {
        // For development: update local state even if API fails
        if (order) {
          setOrder({ ...order, status: newStatus });
        }
        return;
      }

      // Update the order state to reflect the change
      if (order) {
        setOrder({ ...order, status: newStatus });
      }
      setError('');
    } catch (err) {
      console.error('Error updating order status:', err);
      // For development: update local state even if API fails
      if (order) {
        setOrder({ ...order, status: newStatus });
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Load order details on component mount
  useEffect(() => {
    try {
      fetchOrder();
    } catch (err) {
      console.error('Error in order detail useEffect:', err);
      useMockOrderData(id);
    }
  }, [id]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
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
    switch (status?.toLowerCase()) {
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

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <FiRefreshCw className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <Link href="/admin/orders" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r mb-4">
          <p className="text-sm text-yellow-700">Order not found</p>
        </div>
        <Link href="/admin/orders" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/admin/orders" className="mr-4 text-blue-600 hover:text-blue-800 flex items-center">
            <FiArrowLeft className="mr-1" />
            Back
          </Link>
          <h1 className="text-2xl font-bold">Order #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</h1>
        </div>
        <button 
          onClick={fetchOrder}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Order status and actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FiPackage className="text-gray-500 mr-2" />
            <h2 className="text-lg font-medium">Status:</h2>
            <span className={`ml-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Update Status:</span>
            <div className="relative inline-block text-left">
              <select
                disabled={updatingStatus}
                value={order.status}
                onChange={(e) => updateOrderStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {updatingStatus && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <FiRefreshCw className="animate-spin h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order information grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer information */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FiUser className="text-blue-500 mr-2" />
            <h2 className="text-lg font-medium">Customer Information</h2>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>Name:</strong> {order.customer.name}</p>
            <p className="text-gray-700"><strong>Email:</strong> {order.customer.email}</p>
            <p className="text-gray-700"><strong>Phone:</strong> {order.customer.phone || 'N/A'}</p>
            <Link 
              href={`/admin/users/${order.customer.id}`} 
              className="text-blue-600 hover:text-blue-800 inline-flex items-center mt-2"
            >
              View Customer Profile
            </Link>
          </div>
        </div>

        {/* Shipping information */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FiMap className="text-green-500 mr-2" />
            <h2 className="text-lg font-medium">Shipping Information</h2>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>Address:</strong> {order.shipping.address}</p>
            <p className="text-gray-700"><strong>City:</strong> {order.shipping.city}</p>
            <p className="text-gray-700"><strong>State:</strong> {order.shipping.state}</p>
            <p className="text-gray-700"><strong>Postal Code:</strong> {order.shipping.postalCode}</p>
            <p className="text-gray-700"><strong>Country:</strong> {order.shipping.country}</p>
          </div>
        </div>

        {/* Payment information */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FiCreditCard className="text-purple-500 mr-2" />
            <h2 className="text-lg font-medium">Payment Information</h2>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>Method:</strong> {order.payment.method}</p>
            <p className="text-gray-700"><strong>Transaction ID:</strong> {order.payment.transactionId || 'N/A'}</p>
            <p className="text-gray-700"><strong>Status:</strong> {order.payment.status}</p>
            <p className="text-gray-700"><strong>Total Amount:</strong> ₹{order.total.toFixed(2)}</p>
          </div>
        </div>

        {/* Order details */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FiCalendar className="text-orange-500 mr-2" />
            <h2 className="text-lg font-medium">Order Details</h2>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700"><strong>Order ID:</strong> {order.id}</p>
            <p className="text-gray-700"><strong>Order Number:</strong> #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-gray-700"><strong>Order Date:</strong> {formatDate(order.date)}</p>
            <p className="text-gray-700"><strong>Items:</strong> {order.items.reduce((acc, item) => acc + item.quantity, 0)}</p>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FiShoppingBag className="text-indigo-500 mr-2" />
          <h2 className="text-lg font-medium">Order Items</h2>
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
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-10 w-10 rounded-md object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">SKU: {item.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <th scope="row" colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  Subtotal
                </th>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                  ₹{order.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Order Timeline/Activity Log - Placeholder for future implementation */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <div className="flex items-center mb-4">
          <FiTruck className="text-blue-500 mr-2" />
          <h2 className="text-lg font-medium">Order Timeline</h2>
        </div>
        <div className="border-l-2 border-gray-200 ml-4 pl-4 space-y-6">
          <div className="relative">
            <div className="absolute -left-6 mt-1 rounded-full bg-blue-500 w-2 h-2"></div>
            <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
            <p className="font-medium">Order Created</p>
          </div>
          
          {order.status !== 'Pending' && (
            <div className="relative">
              <div className="absolute -left-6 mt-1 rounded-full bg-blue-500 w-2 h-2"></div>
              <p className="text-sm text-gray-500">-</p>
              <p className="font-medium">Order Processing Started</p>
            </div>
          )}

          {(order.status === 'Shipped' || order.status === 'Delivered') && (
            <div className="relative">
              <div className="absolute -left-6 mt-1 rounded-full bg-blue-500 w-2 h-2"></div>
              <p className="text-sm text-gray-500">-</p>
              <p className="font-medium">Order Shipped</p>
            </div>
          )}

          {order.status === 'Delivered' && (
            <div className="relative">
              <div className="absolute -left-6 mt-1 rounded-full bg-green-500 w-2 h-2"></div>
              <p className="text-sm text-gray-500">-</p>
              <p className="font-medium">Order Delivered</p>
            </div>
          )}

          {order.status === 'Cancelled' && (
            <div className="relative">
              <div className="absolute -left-6 mt-1 rounded-full bg-red-500 w-2 h-2"></div>
              <p className="text-sm text-gray-500">-</p>
              <p className="font-medium">Order Cancelled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 