import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/app/models/Order';
import connectMongoDB from '@/app/lib/mongodb';
import { getServerSession } from '@/app/lib/server-auth';
import { cookies } from 'next/headers';
import User from '@/app/models/User';
import Cart from '@/app/models/Cart';
import Product from '@/app/models/Product';

// GET all orders
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromCookies();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }
    
    await connectMongoDB();
    
    // Find all orders for the user
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch orders' 
    }, { status: 500 });
  }
}

// Function to generate mock orders for development
function getMockOrders() {
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
        country: 'India',
      },
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
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
        address: '456 Park Avenue',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'India',
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
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
        country: 'India',
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
    }
  ];
  
  return mockOrders;
}

// POST a new order
export async function POST(request: Request) {
  try {
    // Get user ID from cookies
    const cookie = request.headers.get('cookie') || '';
    const userDataCookieMatch = cookie.match(/userData=([^;]+)/);
    
    if (!userDataCookieMatch) {
      console.error('Order API: No userData cookie found');
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }
    
    let userId;
    try {
      const userData = JSON.parse(decodeURIComponent(userDataCookieMatch[1]));
      userId = userData.userId;
      console.log('Order API: User ID from cookie:', userId);
    } catch (err) {
      console.error('Order API: Error parsing user data from cookie:', err);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user data' 
      }, { status: 401 });
    }
    
    if (!userId) {
      console.error('Order API: No user ID found in cookie data');
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }
    
    // Parse request body
    const data = await request.json();
    const { 
      shippingAddress, 
      paymentMethod, 
      saveAddress = false
    } = data;
    
    console.log('Order API: Received order data:', { shippingAddress, paymentMethod, saveAddress });
    
    if (!shippingAddress || !paymentMethod) {
      console.error('Order API: Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'Shipping address and payment method are required' 
      }, { status: 400 });
    }
    
    console.log('Order API: Connecting to MongoDB');
    await connectMongoDB();
    
    // Get user cart
    console.log('Order API: Finding cart for user:', userId);
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      console.log('Order API: Cart is empty, checking localStorage');
      
      // If server cart is empty, check request body for cart items
      if (!data.cartItems || !Array.isArray(data.cartItems) || data.cartItems.length === 0) {
        console.error('Order API: No cart items found');
        return NextResponse.json({ 
          success: false, 
          error: 'Cart is empty' 
        }, { status: 400 });
      }
      
      // Create a new cart with the provided items
      const newCart = new Cart({
        user: userId,
        items: data.cartItems.map((item: any) => ({
          product: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        subtotal: data.cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
      });
      
      await newCart.save();
      console.log('Order API: Created new cart from provided items');
      
      // Use the new cart for order creation
      cart = newCart;
    }
    
    console.log('Order API: Cart found with', cart.items.length, 'items');
    
    // Calculate order totals
    const subtotal = cart.items.reduce((sum: any, item: any) => sum + (item.price * item.quantity), 0);
    const shippingPrice = subtotal > 500 ? 0 : 50; // Free shipping over 500
    const total = subtotal + shippingPrice;
    
    // Generate unique order ID
    const orderId = generateOrderId();
    console.log('Order API: Generated order ID:', orderId);
    
    // Create order
    const order = new Order({
      user: userId,
      orderId,
      orderItems: cart.items.map((item: any) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      shippingAddress,
      paymentMethod,
      paymentResult: paymentMethod === 'COD' ? {
        status: 'Pending',
        method: 'Cash on Delivery'
      } : {
        status: 'Pending',
        method: 'Online Payment'
      },
      itemsPrice: subtotal,
      shippingPrice,
      totalPrice: total,
      isPaid: false,
      paidAt: paymentMethod === 'COD' ? null : new Date(),
      isDelivered: false
    });
    
    // Save order
    console.log('Order API: Saving order');
    const savedOrder = await order.save();
    console.log('Order API: Order saved successfully');
    
    // Save address to user profile if requested
    if (saveAddress) {
      console.log('Order API: Saving address to user profile');
      await User.findByIdAndUpdate(
        userId,
        { 
          $push: { 
            addresses: {
              addressId: new mongoose.Types.ObjectId().toString(),
              fullName: shippingAddress.fullName,
              addressLine1: shippingAddress.address,
              city: shippingAddress.city,
              state: shippingAddress.state || '',
              pincode: shippingAddress.postalCode,
              country: shippingAddress.country,
              phone: shippingAddress.phone,
              isDefault: false
            } 
          } 
        }
      );
    }
    
    // Clear cart after successful order
    cart.items = [];
    cart.subtotal = 0;
    await cart.save();
    console.log('Order API: Cart cleared');
    
    return NextResponse.json({ 
      success: true, 
      order: {
        orderId: savedOrder.orderId,
        _id: savedOrder._id,
        totalPrice: savedOrder.totalPrice,
        paymentMethod: savedOrder.paymentMethod
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Order API: Error creating order:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create order' 
    }, { status: 500 });
  }
}

// API endpoint to update order status
export async function PATCH(request: Request) {
  try {
    const { orderId, status } = await request.json();
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }
    
    // Connect to database
    await connectMongoDB();
    
    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      order: {
        id: order._id.toString(),
        status: order.status,
      }
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: (error as Error).message || 'Error updating order' }, { status: 500 });
  }
}

// Helper function to extract user ID from cookies
const getUserIdFromCookies = async () => {
  const cookieStore = await cookies();
  const userData = cookieStore.get('userData');
  
  if (!userData) return null;
  
  try {
    const parsedData = JSON.parse(userData.value);
    return parsedData.userId;
  } catch (err) {
    console.error('Error parsing user data from cookie:', err);
    return null;
  }
};

// Generate a unique order ID
const generateOrderId = () => {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}${random}`;
}; 