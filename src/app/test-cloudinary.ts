import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dzzxpyqif',
  api_key: '992368173733427',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET_HERE'
});

/**
 * Test function to verify Cloudinary configuration
 */
export async function testCloudinaryConnection() {
  try {
    // Ping Cloudinary to check connection
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection successful:', result);
    return { success: true, message: 'Cloudinary connection successful', data: result };
  } catch (error) {
    console.error('Cloudinary connection failed:', error);
    return { success: false, message: 'Cloudinary connection failed', error };
  }
}

/**
 * Test image upload to Cloudinary
 */
export async function testImageUpload(imageUrl: string = 'https://res.cloudinary.com/demo/image/upload/sample.jpg') {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'perfume-store-test',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    console.log('Test upload successful:', {
      public_id: result.public_id,
      url: result.secure_url,
      format: result.format
    });
    
    return { 
      success: true, 
      message: 'Test upload successful', 
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format
      }
    };
  } catch (error) {
    console.error('Test upload failed:', error);
    return { success: false, message: 'Test upload failed', error };
  }
}

/**
 * Test image transformation
 */
export function testImageTransformation(publicId: string) {
  try {
    // Generate different transformations
    const transformations = {
      thumbnail: cloudinary.url(publicId, {
        width: 150,
        height: 150,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      optimized: cloudinary.url(publicId, {
        quality: 'auto',
        fetch_format: 'auto'
      }),
      cropped: cloudinary.url(publicId, {
        width: 500,
        height: 500,
        crop: 'crop',
        gravity: 'auto',
        quality: 'auto',
        fetch_format: 'auto'
      })
    };
    
    console.log('Test transformations generated:', transformations);
    return { success: true, message: 'Test transformations generated', data: transformations };
  } catch (error) {
    console.error('Test transformations failed:', error);
    return { success: false, message: 'Test transformations failed', error };
  }
}

// Export default for direct imports
export default {
  testCloudinaryConnection,
  testImageUpload,
  testImageTransformation
}; 