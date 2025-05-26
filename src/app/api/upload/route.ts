import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadVideo, deleteFile } from '@/app/lib/cloudinary';

// Define valid resource types
type ResourceType = 'image' | 'video' | 'raw' | 'auto';

// Maximum file size (5MB for images, 50MB for videos)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const resourceTypeInput = formData.get('resourceType') as string;
    const folder = formData.get('folder') as string || 'perfume_products';
    
    console.log(`File received: ${file?.name}, type: ${file?.type}, size: ${file?.size}`);
    console.log(`Resource type input: ${resourceTypeInput}`);
    
    // Validate resource type
    const resourceType = resourceTypeInput === 'video' ? 'video' : 'image';
    
    console.log(`Using resource type: ${resourceType}`);
    
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json({ 
        success: false,
        error: 'No file provided' 
      }, { status: 400 });
    }
    
    // Validate file size
    const MAX_SIZE = resourceType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > MAX_SIZE) {
      console.error(`File too large: ${file.size} bytes`);
      return NextResponse.json({ 
        success: false,
        error: `File too large. Maximum size is ${MAX_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }
    
    // Convert File to base64 for Cloudinary
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const base64File = `data:${file.type};base64,${base64String}`;
    
    console.log('Starting Cloudinary upload...');
    
    // Upload to Cloudinary
    let result;
    if (resourceType === 'video') {
      result = await uploadVideo(base64File, folder);
    } else {
      result = await uploadImage(base64File, folder);
    }
    
    console.log('Upload completed successfully');
    console.log('Cloudinary response:', {
      public_id: result.public_id,
      url: result.secure_url || result.url,
      format: result.format
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      url: result.secure_url || result.url
    });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to upload file',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    
    if (!publicId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No public ID provided' 
      }, { status: 400 });
    }
    
    console.log(`Deleting file with ID: ${publicId}`);
    
    // Delete the file from Cloudinary
    const result = await deleteFile(publicId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete file',
        details: error.toString()
      },
      { status: 500 }
    );
  }
} 