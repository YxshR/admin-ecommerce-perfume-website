import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import Cart from '@/app/models/Cart';
import Product from '@/app/models/Product';
import mongoose from 'mongoose';

// Define types for cart items
interface CartItem {
  product: mongoose.Types.ObjectId | string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  _id?: string;
}

interface CartDocument {
  user: string;
  items: CartItem[];
  subtotal: number;
  _id?: string;
  save: () => Promise<any>;
}

interface ProductDocument {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
}

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

// GET endpoint to fetch user's cart
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
    
    // Find user's cart
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    // If cart doesn't exist, create an empty one
    if (!cart) {
      cart = {
        items: [],
        subtotal: 0
      };
    }
    
    // Return cart data
    return NextResponse.json({
      success: true,
      cart: {
        items: cart.items.map((item: CartItem) => ({
          id: item.product._id?.toString() || item.product.toString(),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        subtotal: cart.subtotal
      }
    }, {
      headers: createNoCacheHeaders()
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { 
      status: 500,
      headers: createNoCacheHeaders()
    });
  }
}

// POST endpoint to add/update cart items
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
    const { productId, quantity } = await request.json();
    
    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid product ID or quantity' 
      }, { status: 400 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find product
    const product = await Product.findById(productId) as ProductDocument;
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    // Find or create user's cart
    let cart = await Cart.findOne({ user: userId }) as CartDocument;
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        subtotal: 0
      });
    }
    
    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      (item: CartItem) => item.product.toString() === productId
    );
    
    if (itemIndex > -1) {
      // Update existing item
      cart.items[itemIndex].quantity = quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images[0]?.url || ''
      });
    }
    
    // Save cart
    await cart.save();
    
    // Return updated cart
    return NextResponse.json({
      success: true,
      cart: {
        items: cart.items.map((item: CartItem) => ({
          id: item.product.toString(),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        subtotal: cart.subtotal
      }
    }, {
      headers: createNoCacheHeaders()
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { 
      status: 500,
      headers: createNoCacheHeaders()
    });
  }
}

// DELETE endpoint to remove item from cart
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
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId }) as CartDocument;
    
    if (!cart) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cart not found' 
      }, { status: 404 });
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(
      (item: CartItem) => item.product.toString() !== productId
    );
    
    // Save cart
    await cart.save();
    
    // Return updated cart
    return NextResponse.json({
      success: true,
      cart: {
        items: cart.items.map((item: CartItem) => ({
          id: item.product.toString(),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        subtotal: cart.subtotal
      }
    }, {
      headers: createNoCacheHeaders()
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { 
      status: 500,
      headers: createNoCacheHeaders()
    });
  }
}

// PUT endpoint to update the entire cart
export async function PUT(request: Request) {
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
    const { items } = await request.json();
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid cart items' 
      }, { status: 400 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find or create user's cart
    let cart = await Cart.findOne({ user: userId }) as CartDocument;
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        subtotal: 0
      });
    }
    
    // Clear current items
    cart.items = [];
    
    // Add new items
    for (const item of items) {
      if (!item.id || !item.quantity) continue;
      
      // Find product
      const product = await Product.findById(item.id) as ProductDocument;
      if (!product) continue;
      
      // Add to cart
      cart.items.push({
        product: item.id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: product.images[0]?.url || ''
      });
    }
    
    // Save cart
    await cart.save();
    
    // Return updated cart
    return NextResponse.json({
      success: true,
      cart: {
        items: cart.items.map((item: CartItem) => ({
          id: item.product.toString(),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        subtotal: cart.subtotal
      }
    }, {
      headers: createNoCacheHeaders()
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { 
      status: 500,
      headers: createNoCacheHeaders()
    });
  }
} 