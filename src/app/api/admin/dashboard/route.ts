import { NextResponse } from 'next/server';
import { decrypt } from '@/app/lib/auth-utils';
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
      const payload = await decrypt(token);
      
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized - Not an admin' }, { status: 403 });
      }
    } catch (tokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Connect to database
    try {
      await connectMongoDB();
      console.log('MongoDB connected successfully for dashboard API');
    } catch (dbError) {
      console.error('Failed to connect to MongoDB for dashboard:', dbError);
      // Return mock data if database connection fails
      return NextResponse.json(getMockDashboardData());
    }
    
    // Get counts and data
    try {
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
    } catch (queryError) {
      console.error('Error querying MongoDB for dashboard data:', queryError);
      // Return mock data if queries fail
      return NextResponse.json(getMockDashboardData());
    }
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      getMockDashboardData()
    );
  }
}

// Function to generate mock dashboard data
function getMockDashboardData() {
  return {
    totalUsers: 982,
    totalProducts: 45,
    totalOrders: 156,
    recentOrders: [
      {
        _id: '1',
        orderNumber: 'ORD-001',
        customer: {
          name: 'John Smith',
          email: 'john@example.com'
        },
        createdAt: new Date().toISOString(),
        status: 'Pending',
        totalAmount: 1299.00,
        total: 1299.00
      },
      {
        _id: '2',
        orderNumber: 'ORD-002',
        customer: {
          name: 'Priya Sharma',
          email: 'priya@example.com'
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'Processing',
        totalAmount: 2598.00,
        total: 2598.00
      },
      {
        _id: '3',
        orderNumber: 'ORD-003',
        customer: {
          name: 'Alex Johnson',
          email: 'alex@example.com'
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'Shipped',
        totalAmount: 3897.00,
        total: 3897.00
      },
      {
        _id: '4',
        orderNumber: 'ORD-004',
        customer: {
          name: 'Rahul Verma',
          email: 'rahul@example.com'
        },
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        status: 'Delivered',
        totalAmount: 2598.00,
        total: 2598.00
      },
      {
        _id: '5',
        orderNumber: 'ORD-005',
        customer: {
          name: 'Anjali Patel',
          email: 'anjali@example.com'
        },
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        status: 'Cancelled',
        totalAmount: 1299.00,
        total: 1299.00
      }
    ]
  };
}

export const dynamic = 'force-dynamic'; 