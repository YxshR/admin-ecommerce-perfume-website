import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/app/models/Order';
import connectMongoDB from '@/app/lib/mongodb';

// GET a specific order by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectMongoDB();
    
    // Find the order with specified ID
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Format the order for API response
    const formattedOrder = {
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
      payment: {
        method: order.paymentMethod || 'Unknown',
        transactionId: order.paymentDetails?.transactionId || '',
        status: order.paymentStatus || 'pending',
      },
    };
    
    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Error fetching order' },
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