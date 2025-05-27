'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Define section types matching admin panel
interface Section {
  id: string;
  type: 'product' | 'image' | 'video' | 'text' | 'banner' | 'gallery';
  content: any;
  position: number;
}

// Define product type
interface Product {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const fetchHomePageLayout = async () => {
      try {
        setLoading(true);
        
        // Fetch layout for homepage
        const layoutResponse = await fetch('/api/layout/page?pageId=home');
        
        if (!layoutResponse.ok) {
          throw new Error(`Failed to load homepage layout: ${layoutResponse.status}`);
        }
        
        const layoutData = await layoutResponse.json();
        
        if (layoutData.layout && layoutData.layout.sections) {
          // Sort sections by position
          const sortedSections = [...layoutData.layout.sections].sort((a, b) => a.position - b.position);
          setSections(sortedSections);
          
          // Get all product IDs from product sections
          const productIds: string[] = [];
          sortedSections.forEach(section => {
            if (section.type === 'product' && section.content.productIds) {
              productIds.push(...section.content.productIds);
            }
          });
          
          // Fetch product data if we have product sections
          if (productIds.length > 0) {
            const productsResponse = await fetch(`/api/products?ids=${productIds.join(',')}`);
            if (productsResponse.ok) {
              const productsData = await productsResponse.json();
              setFeaturedProducts(productsData.products || []);
            }
          }
        }
      } catch (error) {
        console.error('Error loading homepage layout:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomePageLayout();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen">
      {sections.length === 0 ? (
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-3xl font-bold mb-6">Welcome to Our Perfume Store</h1>
          <p className="text-gray-600 mb-8">The homepage is currently being customized. Please check back soon!</p>
          <Link href="/collection" className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark">
            Browse Our Collection
          </Link>
        </div>
      ) : (
        <>
          {sections.map((section) => (
            <div key={section.id} className="mb-16">
              {/* Banner Section */}
              {section.type === 'banner' && (
                <div className="relative">
                  <div className="h-[70vh] w-full relative">
                    {section.content.imageUrl && (
                      <Image 
                        src={section.content.imageUrl} 
                        alt={section.content.title || 'Banner'} 
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white px-4">
                      {section.content.title && (
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">{section.content.title}</h1>
                      )}
                      {section.content.subtitle && (
                        <p className="text-xl md:text-2xl mb-8 text-center">{section.content.subtitle}</p>
                      )}
                      {section.content.buttonText && section.content.buttonLink && (
                        <Link href={section.content.buttonLink} className="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary-dark">
                          {section.content.buttonText}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Product Section */}
              {section.type === 'product' && (
                <div className="container mx-auto px-4 py-12">
                  {section.content.title && (
                    <h2 className="text-3xl font-bold mb-8 text-center">{section.content.title}</h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {section.content.productIds && section.content.productIds.map((productId: string) => {
                      const product = featuredProducts.find(p => p._id === productId);
                      if (!product) return null;
                      
                      return (
                        <Link 
                          href={`/product/${product._id}`} 
                          key={product._id}
                          className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="aspect-square relative bg-gray-100">
                            {product.images && product.images[0] && (
                              <Image 
                                src={product.images[0].url} 
                                alt={product.name} 
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                            <p className="text-primary font-bold">₹{product.price.toLocaleString()}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {section.content.buttonText && section.content.buttonLink && (
                    <div className="text-center mt-8">
                      <Link href={section.content.buttonLink} className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark inline-block">
                        {section.content.buttonText}
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {/* Text Section */}
              {section.type === 'text' && (
                <div className="container mx-auto px-4 py-12">
                  {section.content.title && (
                    <h2 className="text-3xl font-bold mb-6 text-center">{section.content.title}</h2>
                  )}
                  {section.content.body && (
                    <div className="prose max-w-3xl mx-auto">{section.content.body}</div>
                  )}
                </div>
              )}
              
              {/* Image Section */}
              {section.type === 'image' && (
                <div className="container mx-auto px-4 py-12">
                  {section.content.title && (
                    <h2 className="text-3xl font-bold mb-6 text-center">{section.content.title}</h2>
                  )}
                  {section.content.imageUrl && (
                    <div className="max-w-4xl mx-auto relative aspect-video">
                      <Image 
                        src={section.content.imageUrl} 
                        alt={section.content.title || 'Image'} 
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  {section.content.description && (
                    <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">{section.content.description}</p>
                  )}
                </div>
              )}
              
              {/* Video Section */}
              {section.type === 'video' && (
                <div className="container mx-auto px-4 py-12">
                  {section.content.title && (
                    <h2 className="text-3xl font-bold mb-6 text-center">{section.content.title}</h2>
                  )}
                  {section.content.videoUrl && (
                    <div className="max-w-4xl mx-auto">
                      <div className="aspect-video relative">
                        <video 
                          autoPlay
                          loop
                          muted={false}
                          playsInline
                          controls={false}
                          className="w-full h-full object-cover rounded-lg"
                          onContextMenu={(e) => e.preventDefault()}
                          style={{ pointerEvents: 'none' }}
                        >
                          <source src={section.content.videoUrl} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}
                  {section.content.description && (
                    <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">{section.content.description}</p>
                  )}
                </div>
              )}
              
              {/* Gallery Section */}
              {section.type === 'gallery' && (
                <div className="container mx-auto px-4 py-12">
                  {section.content.title && (
                    <h2 className="text-3xl font-bold mb-6 text-center">{section.content.title}</h2>
                  )}
                  {section.content.mediaItems && section.content.mediaItems.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.content.mediaItems.map((item: any, index: number) => (
                        <div key={index} className="rounded-lg overflow-hidden">
                          {item.type === 'image' ? (
                            <div className="aspect-square relative">
                              <Image 
                                src={item.url} 
                                alt={item.title || `Gallery item ${index + 1}`} 
                                fill
                                className="object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video relative">
                              <video 
                                autoPlay
                                loop
                                muted={false}
                                playsInline
                                controls={false}
                                className="w-full h-full object-cover"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ pointerEvents: 'none' }}
                              >
                                <source src={item.url} />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </main>
  );
}
