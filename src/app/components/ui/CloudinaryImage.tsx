'use client';

import React from 'react';
import Image from 'next/image';
import { getOptimizedUrl, getPublicIdFromUrl } from '@/app/lib/cloudinary';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  crop?: 'fill' | 'scale' | 'fit' | 'pad' | 'thumb';
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  crop = 'fill',
  sizes = '100vw',
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  objectFit = 'cover',
}) => {
  // Check if the source is a Cloudinary URL
  const isCloudinaryUrl = src?.includes('res.cloudinary.com');
  
  // If it's a Cloudinary URL, optimize it
  const imageSrc = isCloudinaryUrl
    ? getOptimizedUrl(getPublicIdFromUrl(src), { width, height, crop })
    : src;
  
  // Generate a low-quality placeholder if needed
  const placeholderUrl = isCloudinaryUrl && placeholder === 'blur' && !blurDataURL
    ? getOptimizedUrl(getPublicIdFromUrl(src), { width: 10, height: 10, crop })
    : blurDataURL;
  
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={imageSrc}
        alt={alt}
        fill={!width || !height}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholderUrl}
        style={{ objectFit }}
        className={className}
      />
    </div>
  );
};

export default CloudinaryImage; 