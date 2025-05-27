import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/app/models/Order';
import connectMongoDB from '@/app/lib/mongodb';
import { decrypt } from '@/app/lib/auth-utils';
import { cookies } from 'next/headers';

// Define a type for the order document
type OrderDocument = {
  _id: mongoose.Types.ObjectId;
  orderNumber?: string;
  user?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  items?: Array<{
    _id?: mongoose.Types.ObjectId;
    product?: {
      _id: mongoose.Types.ObjectId;
      name: string;
      price: number;
      images?: string[];
    };
    name?: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  status?: string;
  totalPrice?: number;
  createdAt?: Date;
  paymentMethod?: string;
  paymentResult?: {
    id: string;
    status: string;
  };
  isPaid?: boolean;
};

// GET order by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Order API: Fetching order with ID:', params.id);
    
    // Get user ID from cookies
    const userId = await getUserIdFromCookies(request);
    
    if (!userId) {
      console.error('Order API: User not authenticated');
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }
    
    await connectMongoDB();
    
    // Find the order
    const order = await Order.findOne({ 
      $or: [
        { _id: params.id },
        { orderId: params.id }
      ],
      user: userId
    });
    
    if (!order) {
      console.error('Order API: Order not found with ID:', params.id);
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }
    
    console.log('Order API: Order found:', order._id);
    
    return NextResponse.json({ 
      success: true, 
      order: {
        _id: order._id,
        orderId: order.orderId,
        items: order.orderItems || [],
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentResult: order.paymentResult || {},
        itemsPrice: order.itemsPrice,
        shippingPrice: order.shippingPrice,
        taxPrice: order.taxPrice || 0,
        totalPrice: order.totalPrice,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        isDelivered: order.isDelivered,
        status: order.status || 'Processing',
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Order API: Error fetching order:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch order' 
    }, { status: 500 });
  }
}

// Helper function to extract user ID from cookies
const getUserIdFromCookies = async (request: Request) => {
  try {
    const cookie = request.headers.get('cookie') || '';
    const userDataCookieMatch = cookie.match(/userData=([^;]+)/);
    
    if (!userDataCookieMatch) {
      return null;
    }
    
    const userData = JSON.parse(decodeURIComponent(userDataCookieMatch[1]));
    return userData.userId;
  } catch (err) {
    console.error('Error parsing user data from cookie:', err);
    return null;
  }
};

// Update order status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromCookies(request);
    const { id } = params;
    
    // For order status updates, we might need admin privileges
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    
    // Regular users can only update their own orders with limited capabilities
    if (!adminToken?.value && (!userId || !id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    await connectMongoDB();
    
    // Parse request body
    const data = await request.json();
    const { status, isPaid, isDelivered, trackingNumber } = data;
    
    // Find the order
    const order = await Order.findOne({
      $or: [
        { _id: id },
        { orderId: id }
      ]
    });
    
    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }
    
    // If not admin, ensure user can only update their own orders
    if (!adminToken?.value && order.user.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized to update this order' 
      }, { status: 403 });
    }
    
    // Update fields if provided
    const updateData: any = {};
    
    if (status) updateData.status = status;
    
    if (isPaid !== undefined) {
      updateData.isPaid = isPaid;
      if (isPaid && !order.isPaid) {
        updateData.paidAt = new Date();
      }
    }
    
    if (isDelivered !== undefined) {
      updateData.isDelivered = isDelivered;
      if (isDelivered && !order.isDelivered) {
        updateData.deliveredAt = new Date();
      }
    }
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      { $set: updateData },
      { new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update order' 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 