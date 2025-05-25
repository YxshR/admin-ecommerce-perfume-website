import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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
    // Authentication check
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    const regularToken = cookieStore.get('token');
    
    if (!adminToken?.value && !regularToken?.value) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    
    await connectMongoDB();
    
    // Get form data
    const formData = await request.formData();
    
    // Parse product info from form data
    const productInfoJson = formData.get('productInfo') as string;
    if (!productInfoJson) {
      return NextResponse.json({ success: false, error: 'Product information is required' }, { status: 400 });
    }
    
    const productInfo = JSON.parse(productInfoJson);
    
    // Handle images if they exist
    const images = [];
    for (let [key, value] of formData.entries()) {
      if (key.startsWith('media_') && value instanceof File) {
        // In a real app, you would upload these files to a storage service
        // For now, we'll just use their names
        images.push(`/uploads/${value.name}`);
      }
    }
    
    // Set main image or default if none provided
    const mainImage = productInfo.mainImage || (images.length > 0 ? images[0] : '/placeholder.jpg');
    
    // Create product with all fields - Fix category to be a string not an ObjectId
    const productData = {
      name: productInfo.name,
      slug: productInfo.slug,
      description: productInfo.description,
      price: productInfo.price,
      comparePrice: productInfo.comparePrice,
      images: images,
      mainImage: mainImage,
      category: productInfo.category.join(', '), // Convert array to string with commas
      brand: productInfo.brand || 'Fraganote',
      sku: productInfo.sku,
      quantity: productInfo.quantity || 0,
      featured: productInfo.featured || false,
      isNewProduct: productInfo.new_arrival || false,
      onSale: productInfo.comparePrice && productInfo.comparePrice > productInfo.price,
      attributes: {
        gender: productInfo.gender,
        volume: productInfo.volume,
        about: productInfo.about,
        disclaimer: productInfo.disclaimer || ''
      }
    };
    
    // Save to database
    const product = await Product.create(productData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product created successfully',
      product 
    }, { status: 201 });
  } catch (err) {
    console.error('Error creating product:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Server error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 