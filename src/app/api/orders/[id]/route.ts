import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/app/models/Order';
import connectMongoDB from '@/app/lib/mongodb';
import { decrypt } from '@/app/lib/auth-utils';

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

// GET a specific order by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get order ID from params
    const { id } = params;

    // Verify admin token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }
    
    try {
      const payload = await decrypt(token);
      
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized - Not an admin' }, { status: 403 });
      }
    } catch (tokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to MongoDB
    await connectMongoDB();
    
    // Find the order by ID
    const order = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images')
      .lean() as OrderDocument;
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Format the order for the response
    const formattedOrder = {
      id: order._id.toString(),
      orderNumber: order.orderNumber || order._id.toString().slice(0, 8).toUpperCase(),
      customer: {
        id: order.user?._id?.toString() || 'guest',
        name: order.user?.name || order.shippingAddress?.fullName || 'Guest Customer',
        email: order.user?.email || 'guest@example.com',
        phone: order.user?.phone || order.shippingAddress?.phone || '',
      },
      date: order.createdAt?.toISOString() || new Date().toISOString(),
      status: order.status || 'Pending',
      total: order.totalPrice || 0,
      items: order.items?.map((item: any) => ({
        id: item.product?._id?.toString() || item._id?.toString() || '',
        name: item.name || item.product?.name || 'Product',
        quantity: item.quantity || 1,
        price: item.price || 0,
        image: (item.product?.images && item.product.images[0]) || item.image || '',
      })) || [],
      shipping: {
        address: order.shippingAddress?.address || '',
        city: order.shippingAddress?.city || '',
        state: order.shippingAddress?.state || '',
        postalCode: order.shippingAddress?.postalCode || '',
        country: order.shippingAddress?.country || '',
      },
      payment: {
        method: order.paymentMethod || 'Unknown',
        transactionId: order.paymentResult?.id || '',
        status: order.isPaid ? 'completed' : 'pending',
      },
    };
    
    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update an order's status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectMongoDB();
    
    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      order: {
        id: updatedOrder._id.toString(),
        status: updatedOrder.status,
      }
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Error updating order' },
      { status: 500 }
    );
  }
} 

export const dynamic = 'force-dynamic'; 