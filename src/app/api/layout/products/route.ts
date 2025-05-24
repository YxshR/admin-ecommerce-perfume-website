import { NextResponse } from 'next/server';
import Product, { IProduct } from '@/app/models/Product';
import { connectToDatabase } from '@/app/lib/db-connect';
import { getDocumentId } from '@/app/lib/mongoose-helpers';

// Helper function to securely log only in development
const isProduction = process.env.NODE_ENV === 'production';
const secureLog = (message: string) => {
  if (!isProduction) {
    console.log(`[DEV API] ${message}`);
  }
};

// GET layout products
export async function GET() {
  try {
    secureLog('Fetching products for layout');
    
    try {
      // Connect to MongoDB
      await connectToDatabase();
      
      // Fetch products from the database
      const products = await Product.find({ 
        // Get some featured or bestselling products for layout usage
        $or: [
          { featured: true },
          { best_seller: true }
        ]
      })
      .select('name price images slug')
      .limit(8)  // Limit to 8 products
      .sort({ createdAt: -1 });
      
      secureLog(`Found ${products.length} products for layout`);
      
      // Format products for the API response
      const formattedProducts = products.map((productDoc) => {
        const product = productDoc.toObject();
        return {
          _id: getDocumentId(productDoc),
          name: product.name,
          price: product.price,
          slug: product.slug,
          images: product.images
        };
      });
      
      return NextResponse.json({ 
        success: true, 
        products: formattedProducts 
      }, { status: 200 });
      
    } catch (dbError) {
      // If database connection fails, use fallback placeholders
      secureLog('Database connection failed, using fallback products');
      if (!isProduction) {
        console.error('Database error details:', dbError);
      }
      
      // Fallback products (only used if database connection fails)
      const fallbackProducts = [
        {
          _id: 'fallback-prod-1',
          name: 'Royal Oud Perfume',
          price: 2999,
          slug: 'royal-oud-perfume',
          images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Royal+Oud' }]
        },
        {
          _id: 'fallback-prod-2',
          name: 'Floral Dreams',
          price: 1899,
          slug: 'floral-dreams',
          images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Floral+Dreams' }]
        },
        {
          _id: 'fallback-prod-3',
          name: 'Citrus Splash',
          price: 1599,
          slug: 'citrus-splash',
          images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Citrus+Splash' }]
        },
        {
          _id: 'fallback-prod-4',
          name: 'Woody Collection',
          price: 2499,
          slug: 'woody-collection',
          images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Woody+Collection' }]
        }
      ];
      
      return NextResponse.json({ 
        success: true, 
        products: fallbackProducts,
        fallback: true 
      }, { status: 200 });
    }
    
  } catch (error) {
    secureLog('Error in layout products API');
    if (!isProduction) {
      console.error('Error details:', error);
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 });
  }
}

// Enable dynamic API route
export const dynamic = 'force-dynamic'; 