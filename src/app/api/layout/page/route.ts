import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Layout from '@/app/lib/layout-model';

export async function GET(req: NextRequest) {
  console.log('[API] Layout page endpoint called');
  
  try {
    // Get the pageId from the query parameter
    const url = new URL(req.url);
    const pageId = url.searchParams.get('pageId');
    
    console.log(`[API] Requested layout for pageId: ${pageId}`);
    
    if (!pageId) {
      console.log('[API] Error: Missing pageId parameter');
      return NextResponse.json({ error: 'Missing pageId parameter' }, { status: 400 });
    }
    
    // Connect to database
    console.log('[API] Connecting to MongoDB...');
    await connectToDatabase();
    console.log('[API] MongoDB connection successful');
    
    // Fetch layout for the specified page
    console.log(`[API] Querying MongoDB for layout with pageId: ${pageId}`);
    const layout = await Layout.findOne({ pageId });
    
    console.log(`[API] Retrieved layout for pageId: ${pageId}, found: ${!!layout}`);
    
    if (layout) {
      console.log(`[API] Layout details: pageId=${layout.pageId}, pageName=${layout.pageName}, sections=${layout.sections?.length || 0}`);
      
      // Log each section for debugging
      if (layout.sections && layout.sections.length > 0) {
        console.log('[API] Layout sections:');
        layout.sections.forEach((section: any, index: number) => {
          console.log(`[API] Section ${index + 1}: id=${section.id}, type=${section.type}, position=${section.position}`);
        });
      } else {
        console.log('[API] Layout has no sections');
      }
    } else {
      console.log(`[API] No layout found for pageId: ${pageId}`);
    }
    
    return NextResponse.json({
      success: true,
      layout
    });
    
  } catch (error) {
    console.error('[API] Error fetching layout:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error fetching layout'
    }, { status: 500 });
  }
} 