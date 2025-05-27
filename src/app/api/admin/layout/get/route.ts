import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Layout from '@/app/lib/layout-model';

export async function GET(req: NextRequest) {
  console.log('[API] Layout get endpoint called');
  
  // Check authorization
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[API] Missing or invalid Authorization header');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Connect to database
    await connectToDatabase();
    
    // Fetch all layouts
    const layouts = await Layout.find({}).sort({ pageName: 1 });
    
    console.log(`[API] Retrieved ${layouts.length} layouts`);
    
    return NextResponse.json({
      success: true,
      layouts
    });
    
  } catch (error) {
    console.error('[API] Error fetching layouts:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error fetching layouts'
    }, { status: 500 });
  }
} 