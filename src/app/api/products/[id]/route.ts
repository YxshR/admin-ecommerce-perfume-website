import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Product from '../../../models/Product';

// Connect to MongoDB with connection pooling
let isConnected = false;

const connectMongo = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    // Prevent multiple connections in development
    if (mongoose.connections[0].readyState) {
      isConnected = true;
      console.log('Using existing MongoDB connection');
      return;
    }
    
    await mongoose.connect("mongodb+srv://Yash:8BQEkh4JaATCGblO@yash.pweao0h.mongodb.net/ecommerce");
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw new Error('Failed to connect to database');
  }
};

// GET a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// UPDATE a product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    const body = await request.json();
    
    // Ensure boolean flags are correctly set
    const productData = {
      ...body,
      featured: typeof body.featured === 'string' ? body.featured === 'true' : !!body.featured,
      new_arrival: typeof body.new_arrival === 'string' ? body.new_arrival === 'true' : !!body.new_arrival, 
      best_seller: typeof body.best_seller === 'string' ? body.best_seller === 'true' : !!body.best_seller
    };
    
    // Handle images
    if (!productData.images || productData.images.length === 0) {
      productData.images = [{ 
        public_id: 'placeholder', 
        url: 'https://i.pinimg.com/564x/5f/74/9f/5f749f794a61f04c579e225e48e46b80.jpg' 
      }];
    }
    
    console.log('Updating product:', params.id);
    console.log('Product flags:', { 
      featured: productData.featured, 
      new_arrival: productData.new_arrival, 
      best_seller: productData.best_seller 
    });
    
    const product = await Product.findByIdAndUpdate(
      params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    console.log('Product updated successfully:', product._id);
    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 });
  }
}

// DELETE a product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    console.log('Product deleted successfully:', params.id);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
} 