import { NextResponse } from 'next/server';
import { verify } from '@/app/lib/auth';
import connectMongoDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Product from '@/app/models/Product';
import Order from '@/app/models/Order';

export async function GET(request: Request) {
  try {
    // Verify admin token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }
    
    try {
      const payload = await verify(token);
      
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized - Not an admin' }, { status: 403 });
      }
    } catch (tokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Connect to database
    await connectMongoDB();
    
    // Get counts and data
    const [totalUsers, totalProducts, totalOrders, recentOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'name email')
        .lean()
    ]);
    
    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      recentOrders
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 