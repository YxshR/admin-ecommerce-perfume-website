import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/app/lib/cloudinary';
import { cookies } from 'next/headers';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    const regularToken = cookieStore.get('token');
    
    if (!adminToken?.value && !regularToken?.value) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'perfume-store';
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        success: false, 
        error: `File size exceeds limit (${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)` 
      }, { status: 400 });
    }
    
    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const base64File = `data:${file.type};base64,${base64String}`;
    
    // Upload to Cloudinary
    const uploadResult = await uploadImage(base64File, folder);
    
    return NextResponse.json({ 
      success: true, 
      data: uploadResult 
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    const regularToken = cookieStore.get('token');
    
    if (!adminToken?.value && !regularToken?.value) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    
    // Get public ID from query params
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    
    if (!publicId) {
      return NextResponse.json({ success: false, error: 'Public ID is required' }, { status: 400 });
    }
    
    // Delete from Cloudinary
    const { deleteImage } = await import('@/app/lib/cloudinary');
    const result = await deleteImage(publicId);
    
    return NextResponse.json({ 
      success: true, 
      result 
    });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll use formData
  },
}; 