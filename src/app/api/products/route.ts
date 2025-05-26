import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Product from '../../models/Product';
import connectMongoDB from '@/app/lib/mongodb';

// GET all products
export async function GET() {
  try {
    console.log('GET /api/products - Starting connection to MongoDB');
    await connectMongoDB();
    console.log('MongoDB connected successfully, fetching products');
    
    const products = await Product.find({}).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products`);
    
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/products:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Server error',
      details: err instanceof Error ? err.stack : 'No stack trace available'
    }, { status: 500 });
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
    
    // Extract media URLs from the product info
    // The media URLs should already be uploaded to Cloudinary at this point
    const mediaItems = productInfo.media || [];
    const images = mediaItems
      .filter((media: any) => media.type === 'image')
      .map((media: any) => media.url);
    
    const videos = mediaItems
      .filter((media: any) => media.type === 'video')
      .map((media: any) => media.url);
    
    // Set main image or default if none provided
    const mainImage = productInfo.mainImage || (images.length > 0 ? images[0] : '/placeholder.jpg');
    
    // Create product with all fields
    const productData = {
      name: productInfo.name,
      slug: productInfo.slug || productInfo.name.toLowerCase().replace(/\s+/g, '-'),
      description: productInfo.description,
      price: parseFloat(productInfo.price.toString()),
      comparePrice: productInfo.comparePrice ? parseFloat(productInfo.comparePrice.toString()) : undefined,
      images: images,
      videos: videos, // Store videos separately
      mainImage: mainImage,
      category: productInfo.category.join(', '), // Convert array to string with commas
      brand: productInfo.brand || 'AVIOTOLUXURY',
      sku: productInfo.sku,
      quantity: parseInt(productInfo.quantity.toString() || '0'),
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