import { NextRequest, NextResponse } from 'next/server';

// A simple test endpoint to check if uploads are working correctly
export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'Test upload API is working' });
}

export async function POST(req: NextRequest) {
  console.log('[API /admin/test-upload] Received POST request');
  console.log('[API /admin/test-upload] Request URL:', req.url);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const fileType = formData.get('type') as string | null;

    console.log('[API /admin/test-upload] Form data keys:', [...formData.keys()]);
    console.log('[API /admin/test-upload] File present:', !!file);
    console.log('[API /admin/test-upload] File type:', fileType);

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }

    // Just echo back the file details without actually uploading
    return NextResponse.json({
      success: true,
      message: 'File received',
      fileDetails: {
        name: file.name,
        type: file.type,
        size: file.size,
        requestedType: fileType
      },
      url: `https://example.com/dummy-${fileType}-url-for-${file.name}`
    });

  } catch (error: any) {
    console.error('[API /admin/test-upload] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'File upload test failed' 
    }, { status: 500 });
  }
} 