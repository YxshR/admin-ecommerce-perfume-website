import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import Wishlist from '@/app/models/Wishlist';
import Product from '@/app/models/Product';
import mongoose from 'mongoose';

// Helper function to extract user ID from cookies
const getUserIdFromCookies = (cookie: string) => {
  const userDataCookieMatch = cookie.match(/userData=([^;]+)/);
  if (!userDataCookieMatch) return null;
  
  try {
    const userData = JSON.parse(decodeURIComponent(userDataCookieMatch[1]));
    return userData.userId;
  } catch (err) {
    console.error('Error parsing user data from cookie:', err);
    return null;
  }
};

// Helper function to create headers with cache control
const createNoCacheHeaders = () => {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };
};

// GET endpoint to fetch user's wishlist
export async function GET(request: Request) {
  try {
    // Get user ID from cookies
    const cookie = request.headers.get('cookie') || '';
    const isLoggedIn = cookie.includes('isLoggedIn=true');
    
    if (!isLoggedIn) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { 
        status: 401,
        headers: createNoCacheHeaders()
      });
    }
    
    const userId = getUserIdFromCookies(cookie);
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User data not found' 
      }, { status: 401 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find user's wishlist and populate product details
    let wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: 'products.product',
        model: 'Product',
        select: 'name price discountedPrice images'
      });
    
    // If wishlist doesn't exist, create an empty one
    if (!wishlist) {
      return NextResponse.json({
        success: true,
        wishlist: {
          items: []
        }
      }, {
        headers: createNoCacheHeaders()
      });
    }
    
    // Format wishlist items for the frontend
    const formattedItems = wishlist.products.map((item: any) => ({
      productId: item.product._id.toString(),
      name: item.product.name,
      price: item.product.discountedPrice > 0 ? item.product.discountedPrice : item.product.price,
      image: item.product.images[0]?.url || '',
      addedAt: item.addedAt
    }));
    
    // Return wishlist data
    return NextResponse.json({
      success: true,
      wishlist: {
        items: formattedItems
      }
    }, {
      headers: createNoCacheHeaders()
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { 
      status: 500,
      headers: createNoCacheHeaders()
    });
  }
}

// POST endpoint to add product to wishlist
export async function POST(request: Request) {
  try {
    // Get user ID from cookies
    const cookie = request.headers.get('cookie') || '';
    const isLoggedIn = cookie.includes('isLoggedIn=true');
    
    if (!isLoggedIn) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    const userId = getUserIdFromCookies(cookie);
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User data not found' 
      }, { status: 401 });
    }
    
    // Parse request body
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product ID is required' 
      }, { status: 400 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    // Find or create user's wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: []
      });
    }
    
    // Check if product already in wishlist
    const productExists = wishlist.products.some(
      (item: any) => item.product.toString() === productId
    );
    
    if (productExists) {
      return NextResponse.json({
        success: true,
        message: 'Product already in wishlist'
      });
    }
    
    // Add product to wishlist
    wishlist.products.push({
      product: productId,
      addedAt: new Date()
    });
    
    // Save wishlist
    await wishlist.save();
    
    // Return success message
    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}

// DELETE endpoint to remove product from wishlist
export async function DELETE(request: Request) {
  try {
    // Get user ID from cookies
    const cookie = request.headers.get('cookie') || '';
    const isLoggedIn = cookie.includes('isLoggedIn=true');
    
    if (!isLoggedIn) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    const userId = getUserIdFromCookies(cookie);
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User data not found' 
      }, { status: 401 });
    }
    
    // Get product ID from URL params
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product ID is required' 
      }, { status: 400 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wishlist not found' 
      }, { status: 404 });
    }
    
    // Check if product is in wishlist
    const productIndex = wishlist.products.findIndex(
      (item: any) => item.product.toString() === productId
    );
    
    if (productIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not in wishlist' 
      }, { status: 404 });
    }
    
    // Remove product from wishlist
    wishlist.products.splice(productIndex, 1);
    
    // Save wishlist
    await wishlist.save();
    
    // Return success message
    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
} 