import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Layout from '@/app/lib/layout-model';

export async function POST(req: NextRequest) {
  console.log('[API] Layout save endpoint called');
  
  // Check authorization
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[API] Missing or invalid Authorization header');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Parse request body
    const { pageId, pageName, pagePath, sections } = await req.json();
    
    if (!pageId || !sections) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Upsert layout data (create or update)
    const result = await Layout.findOneAndUpdate(
      { pageId },
      { 
        pageId,
        pageName,
        pagePath,
        sections,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`[API] Layout for page "${pageName}" (${pageId}) saved successfully`);
    
    return NextResponse.json({
      success: true,
      message: 'Layout saved successfully',
      layout: result
    });
    
  } catch (error) {
    console.error('[API] Error saving layout:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error saving layout'
    }, { status: 500 });
  }
} 