import { NextRequest, NextResponse } from 'next/server';
import { testCloudinaryConnection, testImageUpload, testImageTransformation } from '@/app/test-cloudinary';

export async function GET(request: NextRequest) {
  try {
    // Test connection
    const connectionResult = await testCloudinaryConnection();
    
    if (!connectionResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Cloudinary connection failed',
        error: connectionResult.error
      }, { status: 500 });
    }
    
    // Test upload
    const uploadResult = await testImageUpload();
    
    if (!uploadResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Cloudinary upload test failed',
        error: uploadResult.error
      }, { status: 500 });
    }
    
    // Test transformations
    const transformResult = uploadResult.data && uploadResult.data.public_id 
      ? testImageTransformation(uploadResult.data.public_id)
      : { success: false, message: 'No public ID available for transformation test' };
    
    return NextResponse.json({
      success: true,
      connection: connectionResult,
      upload: uploadResult,
      transformations: transformResult
    });
  } catch (error) {
    console.error('Error testing Cloudinary:', error);
    return NextResponse.json({
      success: false,
      message: 'Error testing Cloudinary',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 