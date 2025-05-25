import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/app/lib/cloudinary';

// Define valid resource types
type ResourceType = 'image' | 'video' | 'raw' | 'auto';

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
    const resourceType: ResourceType = 
      resourceTypeInput && ['image', 'video', 'raw', 'auto'].includes(resourceTypeInput) 
        ? resourceTypeInput as ResourceType 
        : 'image';
    
    console.log(`Using resource type: ${resourceType}`);
    
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json({ 
        success: false,
        error: 'No file provided' 
      }, { status: 400 });
    }
    
    // Validate file size
    const MAX_SIZE = resourceType === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for videos, 5MB for images
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
    
    // Upload to Cloudinary using our utility function
    const result = await uploadImage(base64File, folder);
    
    console.log('Upload completed successfully');
    console.log('Cloudinary response:', {
      public_id: result.public_id,
      url: result.url,
      format: result.format
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      url: result.url
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