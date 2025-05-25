'use client';

import { useState } from 'react';
import CloudinaryImage from '@/app/components/ui/CloudinaryImage';

const demoImages = [
  {
    publicId: 'samples/animals/cat',
    title: 'Cat',
    description: 'A sample cat image from Cloudinary'
  },
  {
    publicId: 'samples/animals/dog',
    title: 'Dog',
    description: 'A sample dog image from Cloudinary'
  },
  {
    publicId: 'samples/food/dessert',
    title: 'Dessert',
    description: 'A sample dessert image from Cloudinary'
  },
  {
    publicId: 'samples/landscapes/beach-boat',
    title: 'Beach Boat',
    description: 'A sample landscape image from Cloudinary'
  }
];

export default function CloudinaryDemoPage() {
  const [selectedImage, setSelectedImage] = useState(demoImages[0]);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Cloudinary Image Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Selected Image: {selectedImage.title}</h2>
          
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <CloudinaryImage
              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzzxpyqif'}/image/upload/${selectedImage.publicId}`}
              alt={selectedImage.title}
              width={600}
              height={400}
              className="w-full h-auto rounded-lg shadow-md"
              priority={true}
            />
            <p className="mt-4 text-gray-700">{selectedImage.description}</p>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {demoImages.map((image) => (
              <button
                key={image.publicId}
                onClick={() => setSelectedImage(image)}
                className={`p-1 rounded-md ${selectedImage.publicId === image.publicId ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'}`}
              >
                <CloudinaryImage
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzzxpyqif'}/image/upload/${image.publicId}`}
                  alt={image.title}
                  width={100}
                  height={100}
                  className="w-full h-auto rounded-md"
                  crop="fill"
                />
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Transformations</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Original</h3>
              <CloudinaryImage
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzzxpyqif'}/image/upload/${selectedImage.publicId}`}
                alt={`${selectedImage.title} - Original`}
                width={300}
                height={200}
                className="w-full h-auto rounded-md shadow-sm"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Grayscale</h3>
              <CloudinaryImage
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzzxpyqif'}/image/upload/e_grayscale/${selectedImage.publicId}`}
                alt={`${selectedImage.title} - Grayscale`}
                width={300}
                height={200}
                className="w-full h-auto rounded-md shadow-sm"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Blur</h3>
              <CloudinaryImage
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzzxpyqif'}/image/upload/e_blur:300/${selectedImage.publicId}`}
                alt={`${selectedImage.title} - Blur`}
                width={300}
                height={200}
                className="w-full h-auto rounded-md shadow-sm"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Sepia</h3>
              <CloudinaryImage
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzzxpyqif'}/image/upload/e_sepia:50/${selectedImage.publicId}`}
                alt={`${selectedImage.title} - Sepia`}
                width={300}
                height={200}
                className="w-full h-auto rounded-md shadow-sm"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Crop (Fill)</h3>
              <CloudinaryImage
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzzxpyqif'}/image/upload/c_fill,g_auto,h_200,w_300/${selectedImage.publicId}`}
                alt={`${selectedImage.title} - Crop Fill`}
                width={300}
                height={200}
                className="w-full h-auto rounded-md shadow-sm"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Rounded Corners</h3>
              <CloudinaryImage
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzzxpyqif'}/image/upload/r_50/${selectedImage.publicId}`}
                alt={`${selectedImage.title} - Rounded Corners`}
                width={300}
                height={200}
                className="w-full h-auto rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <p className="text-gray-700 mb-4">
          This demo showcases the Cloudinary Image component, which optimizes images using Cloudinary's powerful transformation capabilities.
          The component automatically applies quality and format optimizations, and supports various transformations like cropping, resizing, and effects.
        </p>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-auto">
          {`<CloudinaryImage
  src="https://res.cloudinary.com/your-cloud-name/image/upload/your-image-id"
  alt="Image description"
  width={600}
  height={400}
  className="w-full h-auto rounded-lg"
  crop="fill"
/>`}
        </pre>
      </div>
    </div>
  );
} 