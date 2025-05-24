import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'diu6ydnvw',
  api_key: process.env.CLOUDINARY_API_KEY || '234276983864414',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mew7sj5pD-gdC7eITGsZ00JzItA'
});

// Define a type for Cloudinary response
interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  [key: string]: any;
}

// Define valid resource types
type ResourceType = 'image' | 'video' | 'raw' | 'auto';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const resourceTypeInput = formData.get('resourceType') as string;
    
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
    
    // Convert File to buffer for Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(`Buffer created, size: ${buffer.length}`);
    
    // Create a unique filename
    const uniqueFilename = `perfume_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    console.log(`Generated unique filename: ${uniqueFilename}`);
    
    // Upload to Cloudinary using server-side SDK
    console.log('Starting Cloudinary upload...');
    console.log('Cloudinary config:', {
      cloud_name: cloudinary.config().cloud_name,
      api_key_set: !!cloudinary.config().api_key,
    });
    
    const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            public_id: uniqueFilename,
            folder: 'perfume_products'
          },
          (error: any, result: CloudinaryResponse | undefined) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else if (result) {
              console.log(`Upload successful, public_id: ${result.public_id}`);
              resolve(result);
            } else {
              reject(new Error("No result returned from Cloudinary"));
            }
          }
        );
        
        // Handle potential uploadStream errors
        uploadStream.on('error', (error) => {
          console.error('Upload stream error:', error);
          reject(error);
        });
        
        // Write buffer to stream
        uploadStream.write(buffer);
        uploadStream.end();
      } catch (streamError) {
        console.error('Error in upload stream setup:', streamError);
        reject(streamError);
      }
    });
    
    console.log('Upload completed successfully');
    console.log('Cloudinary response:', {
      public_id: result.public_id,
      url: result.secure_url,
      format: result.format,
      resource_type: result.resource_type
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      url: result.secure_url
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