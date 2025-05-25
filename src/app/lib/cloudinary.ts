import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzzxpyqif',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '992368173733427',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Uploads an image to Cloudinary
 * 
 * @param file The image file to upload (can be a file path or base64 data)
 * @param folder Optional folder to organize images
 * @returns The upload result with URLs and other metadata
 */
export const uploadImage = async (
  file: string,
  folder: string = 'perfume-store'
) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Deletes an image from Cloudinary
 * 
 * @param publicId The public ID of the image to delete
 * @returns The result of the deletion operation
 */
export const deleteImage = async (publicId: string) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Generates an optimized Cloudinary URL for an image
 * 
 * @param publicId The public ID of the image
 * @param options Optional transformation options
 * @returns The optimized Cloudinary URL
 */
export const getOptimizedUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    aspectRatio?: string;
  } = {}
) => {
  const {
    width,
    height,
    crop = 'fill',
    aspectRatio,
  } = options;
  
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width, height, crop, aspect_ratio: aspectRatio },
      { fetch_format: 'auto' },
      { quality: 'auto' },
    ],
  });
};

/**
 * Extracts the public ID from a Cloudinary URL
 * 
 * @param url The Cloudinary URL
 * @returns The public ID
 */
export const getPublicIdFromUrl = (url: string): string => {
  // Matches the pattern: https://res.cloudinary.com/cloud-name/image/upload/v123456789/folder/public_id.extension
  const regex = /\/v\d+\/(.+)\./;
  const match = url.match(regex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // Alternative regex for URLs without version number
  const altRegex = /\/upload\/(.+)\./;
  const altMatch = url.match(altRegex);
  
  return altMatch && altMatch[1] ? altMatch[1] : '';
};

export default cloudinary;
