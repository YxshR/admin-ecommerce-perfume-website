import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/app/models/Order';
import connectMongoDB from '@/app/lib/mongodb';
import { getServerSession } from '@/app/lib/server-auth';
import { cookies } from 'next/headers';

// GET all orders
export async function GET() {
  try {
    console.log('Fetching all orders...');
    
    // Connect to the database
    try {
    await connectMongoDB();
      console.log('MongoDB connected successfully for orders API');
    } catch (dbError) {
      console.error('Failed to connect to MongoDB for orders:', dbError);
      // Return mock data if database connection fails
      return NextResponse.json({ 
        success: true, 
        orders: getMockOrders() 
      });
    }
    
    // Fetch orders with related data
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders in database`);
    
    // Format orders for API response
    const formattedOrders = orders.map((order: any) => {
      return {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        customer: {
          id: order.user?._id?.toString() || 'guest',
          name: order.user?.name || order.shippingAddress?.fullName || 'Guest Customer',
          email: order.user?.email || 'guest@example.com',
          phone: order.user?.phone || order.shippingAddress?.phone || '',
        },
        date: order.createdAt?.toISOString() || new Date().toISOString(),
        status: order.status || 'pending',
        total: order.totalAmount || 0,
        items: order.items?.map((item: any) => ({
          id: item.product?._id?.toString() || '',
          name: item.product?.name || 'Product',
          quantity: item.quantity || 1,
          price: item.price || 0,
          image: (item.product?.images && item.product.images[0]) || '',
        })) || [],
        shipping: {
          address: `${order.shippingAddress?.addressLine1 || ''} ${order.shippingAddress?.addressLine2 || ''}`,
          city: order.shippingAddress?.city || '',
          state: order.shippingAddress?.state || '',
          postalCode: order.shippingAddress?.postalCode || '',
          country: order.shippingAddress?.country || '',
        },
        paymentMethod: order.paymentMethod || 'cod',
        paymentStatus: order.isPaid ? 'paid' : 'unpaid',
      };
    });
    
    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    // Return mock data in case of any errors
    return NextResponse.json({ 
      success: true, 
      orders: getMockOrders() 
    });
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
    // Connect to MongoDB using the shared connection function
    const connection = await connectMongoDB();
    console.log('Creating order in database:', connection.connection.db?.databaseName || 'ecommerce');
    
    // Get user ID from cookies
    const cookieStore = cookies();
    const userDataCookie = cookieStore.get('userData');
    let userId = null;
    
    if (userDataCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.value));
        userId = userData.userId;
        console.log('Found user ID in cookies:', userId);
      } catch (err) {
        console.error('Error parsing userData cookie:', err);
      }
    }
    
    // Parse the request body
    const body = await request.json();
    console.log('Received order data:', JSON.stringify(body).substring(0, 200) + '...');
    
    // Ensure we have a user ID
    if (!userId && !body.user) {
      console.error('No user ID provided in request or cookies');
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    // Use userId from cookies if not in body
    if (!body.user && userId) {
      body.user = userId;
    }
    
    // Detailed validation with specific error messages
    const missingFields = [];
    
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      missingFields.push('items');
      console.error('Missing or empty items array in request body');
    }
    
    if (!body.shippingAddress) {
      missingFields.push('shippingAddress');
      console.error('Missing shipping address in request body');
    } else {
      // Check shipping address fields
      const requiredAddressFields = ['fullName', 'address', 'city', 'postalCode', 'country'];
      const missingAddressFields = requiredAddressFields.filter(field => !body.shippingAddress[field]);
      
      if (missingAddressFields.length > 0) {
        missingFields.push(`shippingAddress fields: ${missingAddressFields.join(', ')}`);
        console.error('Missing shipping address fields:', missingAddressFields);
      }
    }
    
    if (!body.paymentMethod) {
      missingFields.push('paymentMethod');
      console.error('Missing payment method in request body');
    }
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required order data: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Create the order
    const order = await Order.create(body);
    console.log('Created order:', order._id, 'in database:', connection.connection.db?.databaseName || 'ecommerce');
    
    return NextResponse.json({ 
      success: true, 
      order: {
        id: order._id.toString(),
        status: order.status
      }
    }, { status: 201 });
  } catch (err) {
    console.error('Error creating order:', err);
    
    // Handle specific errors
    if (err instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: err.message
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
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