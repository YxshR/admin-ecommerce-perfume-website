import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import Product from '@/app/models/Product';
import User from '@/app/models/User';
import Order from '@/app/models/Order';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get counts of products, users, and orders
    const [totalProducts, totalUsers, totalOrders, recentOrders] = await Promise.all([
      Product.countDocuments({}),
      User.countDocuments({}),
      Order.countDocuments({}),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);
    
    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return a fallback response when database is unavailable
    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        recentOrders: []
      },
      error: 'Database connection error. Using fallback data.'
    });
  }
}

// Make sure this endpoint is not cached
export const dynamic = 'force-dynamic'; 