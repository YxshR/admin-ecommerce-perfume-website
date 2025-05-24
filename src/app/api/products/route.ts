import { NextResponse } from 'next/server';
import Product from '../../models/Product';
import connectMongoDB from '@/app/lib/mongodb';

// GET all products
export async function GET() {
  try {
    await connectMongoDB();
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// POST a new product
export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const body = await request.json();
    
    // Ensure boolean flags are correctly set (convert any string values to booleans)
    const productData = {
      ...body,
      featured: typeof body.featured === 'string' ? body.featured === 'true' : !!body.featured,
      new_arrival: typeof body.new_arrival === 'string' ? body.new_arrival === 'true' : !!body.new_arrival, 
      best_seller: typeof body.best_seller === 'string' ? body.best_seller === 'true' : !!body.best_seller
    };
    
    // Handle images
    if (!productData.images || productData.images.length === 0) {
      productData.images = [];
    }
    
    const product = await Product.create(productData);
    
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Server error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 