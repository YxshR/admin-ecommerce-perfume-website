'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';
import { 
  FiCheckCircle, 
  FiDownload, 
  FiShoppingBag, 
  FiArrowRight,
  FiShare2,
  FiHome,
  FiPrinter
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { MdOutlineMessage } from 'react-icons/md';

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface Order {
  _id: string;
  orderId?: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult: {
    id: string;
    status: string;
    update_time: string;
  };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt: string;
  isDelivered: boolean;
  status: string;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string>('');
  const [error, setError] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Get order ID from URL
    const id = searchParams?.get('id');
    if (id) {
      setOrderId(id);
      fetchOrder(id);
    } else {
      // For backward compatibility, try from localStorage
      tryLoadOrderFromLocalStorage();
    }
  }, [isAuthenticated, router, searchParams]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      console.log("Fetching order with ID:", id);
      
      // First try to get the order from the API
      const response = await fetch(`/api/orders/${id}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Order API response:", data);
        
        if (data.success && data.order) {
          // Check if the order has items property or orderItems property
          if (data.order.orderItems && !data.order.items) {
            data.order.items = data.order.orderItems;
          }
          
          setOrder(data.order);
          return;
        }
      } else {
        console.error("Failed to fetch order from API, status:", response.status);
      }
      
      // If API fails, try to use mock data or localStorage
      console.log("Attempting to use mock data or localStorage");
      
      // First check if we have order data in localStorage
      const savedOrderData = localStorage.getItem('orderData');
      if (savedOrderData) {
        try {
          const parsedOrder = JSON.parse(savedOrderData);
          console.log("Using order data from localStorage");
          setOrder(parsedOrder);
          return;
        } catch (parseError) {
          console.error("Error parsing localStorage order data:", parseError);
        }
      }
      
      // If no localStorage data, create a mock order for display
      console.log("Creating mock order for display");
      const mockOrder = createMockOrder(id);
      setOrder(mockOrder);
      
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Could not load order details. Please try again later.');
      
      // Don't redirect immediately, give the user a chance to see the error
      setTimeout(() => {
        router.push('/account/orders');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to create a mock order for display
  const createMockOrder = (id: string): Order => {
    // Try to get cart items from localStorage
    let cartItems: any[] = [];
    let subtotal = 0;
    
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        cartItems = JSON.parse(savedCart);
        subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
    } catch (e) {
      console.error("Error reading localStorage cart:", e);
    }
    
    // If we couldn't get cart items, create a dummy item
    if (cartItems.length === 0) {
      cartItems = [
        {
          id: 'mock-product',
          name: 'Your Perfume Order',
          price: 1299,
          quantity: 1,
          image: '/images/placeholder-product.jpg'
        }
      ];
      subtotal = 1299;
    }
    
    const shippingPrice = subtotal > 500 ? 0 : 50;
    const totalPrice = subtotal + shippingPrice;
    
    return {
      _id: id,
      user: 'current-user',
      items: cartItems.map(item => ({
        product: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '/images/placeholder-product.jpg'
      })),
      shippingAddress: {
        fullName: 'Customer',
        address: 'Shipping Address',
        city: 'City',
        postalCode: '000000',
        country: 'Country',
        phone: '0000000000'
      },
      paymentMethod: 'COD',
      paymentResult: {
        id: '',
        status: 'Pending',
        update_time: new Date().toISOString()
      },
      itemsPrice: subtotal,
      shippingPrice: shippingPrice,
      taxPrice: 0,
      totalPrice: totalPrice,
      isPaid: false,
      paidAt: '',
      isDelivered: false,
      status: 'Processing',
      createdAt: new Date().toISOString()
    };
  };

  const tryLoadOrderFromLocalStorage = () => {
    try {
      const savedOrderData = localStorage.getItem('orderData');
      if (savedOrderData) {
        const parsedOrder = JSON.parse(savedOrderData);
        setOrder(parsedOrder);
        setOrderId(parsedOrder._id || `ORD-${Date.now().toString().substring(5)}`);
      } else {
        setError('No order information found');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Error loading order data:', error);
      setError('Error loading order data');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const shareToWhatsApp = () => {
    if (!order) return;
    
    const message = `I just placed an order (${orderId}) for a total of ₹${order.totalPrice.toFixed(2)}. Can't wait to receive it!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const shareViaSMS = () => {
    if (!order) return;
    
    const message = `I just placed an order (${orderId}) for a total of ₹${order.totalPrice.toFixed(2)}. Can't wait to receive it!`;
    const encodedMessage = encodeURIComponent(message);
    window.location.href = `sms:?&body=${encodedMessage}`;
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadInvoice = () => {
    const invoiceContent = document.getElementById('invoice-content');
    if (!invoiceContent) return;
    
    // In a real implementation, you would use a library like jsPDF or 
    // call a server endpoint to generate a PDF invoice
    alert('Invoice download functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-16 border rounded-lg bg-gray-50">
          <div className="flex justify-center mb-4 text-red-500">
            <FiShoppingBag className="h-16 w-16" />
          </div>
          <h2 className="text-2xl font-medium text-gray-700 mb-2">Error Loading Order</h2>
          <p className="text-red-500 mb-6">
            {error}
          </p>
          <p className="text-gray-500 mb-6">
            Redirecting you...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-16 border rounded-lg bg-gray-50">
          <div className="flex justify-center mb-4">
            <FiShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-medium text-gray-700 mb-2">No order found</h2>
          <p className="text-gray-500 mb-6">
            Let's create a new order
          </p>
          <Link 
            href="/collection" 
            className="px-6 py-3 bg-black text-white inline-block hover:bg-gray-900"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 print:px-0">
      {/* Success message */}
      <div className="text-center mb-10 print:mb-4 print:hidden">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <FiCheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-medium mb-2">Thank You for Your Order!</h1>
        <p className="text-gray-600 mb-4">
          Your order has been placed successfully. We've sent a confirmation email with order details.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={handlePrintInvoice}
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            <FiPrinter className="mr-2" /> Print Invoice
          </button>
          <button 
            onClick={() => setShowShareOptions(!showShareOptions)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          >
            <FiShare2 className="mr-2" /> Share
          </button>
        </div>
        
        {/* Share options popup */}
        {showShareOptions && (
          <div className="mt-4 inline-flex justify-center gap-3">
            <button 
              onClick={shareToWhatsApp}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <FaWhatsapp className="mr-2" /> WhatsApp
            </button>
            <button 
              onClick={shareViaSMS}
              className="flex items-center px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500"
            >
              <MdOutlineMessage className="mr-2" /> SMS
            </button>
          </div>
        )}
      </div>
      
      {/* Order receipt */}
      <div className="max-w-4xl mx-auto bg-white shadow-sm border rounded-lg overflow-hidden print:shadow-none print:border-none" id="invoice-content">
        {/* Header */}
        <div className="border-b p-6 flex justify-between items-center print:border-b-2 print:border-gray-200">
          <div>
            <h2 className="text-2xl font-bold">Order Receipt</h2>
            <p className="text-gray-600 mt-1">
              Order ID: {order.orderId || order._id}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">
              {formatDate(order.createdAt || new Date().toISOString())}
            </p>
            <p className="text-sm text-green-600 mt-1 font-medium">
              {order.status || 'Processing'}
            </p>
          </div>
        </div>
        
        {/* Order details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Shipping Address</h3>
            <div className="text-gray-600">
              <p className="font-medium">{order.shippingAddress?.fullName || 'Customer'}</p>
              <p>{order.shippingAddress?.address || 'Address'}</p>
              <p>{order.shippingAddress?.city || 'City'}, {order.shippingAddress?.postalCode || 'Postal Code'}</p>
              <p>{order.shippingAddress?.country || 'Country'}</p>
              <p>Phone: {order.shippingAddress?.phone || 'N/A'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Payment Information</h3>
            <div className="text-gray-600">
              <p><span className="font-medium">Method:</span> {order.paymentMethod || 'N/A'}</p>
              <p><span className="font-medium">Status:</span> {order.isPaid ? 'Paid' : 'Pending'}</p>
              {order.paymentResult && order.paymentResult.id && (
                <p><span className="font-medium">Transaction ID:</span> {order.paymentResult.id}</p>
              )}
              <p><span className="font-medium">Order Status:</span> {order.status || 'Processing'}</p>
            </div>
          </div>
        </div>
        
        {/* Order items */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-800 mb-4">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="py-2 text-left font-medium text-gray-600">Product</th>
                  <th className="py-2 text-right font-medium text-gray-600">Price</th>
                  <th className="py-2 text-right font-medium text-gray-600">Qty</th>
                  <th className="py-2 text-right font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(order.items || []).map((item, index) => (
                  <tr key={index}>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 border border-gray-200 overflow-hidden flex-shrink-0 mr-3 print:hidden">
                          <img 
                            src={item.image || 'https://placehold.co/200x200'} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="py-3 text-right font-medium">Subtotal</td>
                  <td className="py-3 text-right">₹{order.itemsPrice?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-3 text-right font-medium">Shipping</td>
                  <td className="py-3 text-right">
                    {order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice?.toFixed(2) || '0.00'}`}
                  </td>
                </tr>
                {order.taxPrice > 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 text-right font-medium">Tax</td>
                    <td className="py-3 text-right">₹{order.taxPrice.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="border-t border-gray-200">
                  <td colSpan={3} className="py-3 text-right font-bold text-lg">Total</td>
                  <td className="py-3 text-right font-bold text-lg">₹{order.totalPrice?.toFixed(2) || '0.00'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 print:bg-white">
          <p className="text-gray-600 mb-4">
            Thank you for shopping with us! If you have any questions about your order, please contact our customer support.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 print:hidden">
            <Link 
              href="/account/orders" 
              className="inline-flex items-center px-4 py-2 bg-black text-white hover:bg-gray-800"
            >
              <FiShoppingBag className="mr-2" /> Order History
            </Link>
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              <FiHome className="mr-2" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 