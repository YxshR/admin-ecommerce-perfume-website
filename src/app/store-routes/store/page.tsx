'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '../../components/store/ProductCard';
import SaleCarousel from '@/app/components/SaleCarousel';

// Debug helper function
const debug = (message: string, data?: any) => {
  console.log(`[STORE] ${message}`, data !== undefined ? data : '');
};

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  category: string;
  images: { url: string }[];
  rating: number;
  featured: boolean;
  new_arrival: boolean;
  best_seller: boolean;
}

interface Section {
  id: string;
  type: 'product' | 'image' | 'video' | 'text' | 'banner' | 'gallery';
  content: any;
  position: number;
}

interface LayoutData {
  pageId: string;
  pageName: string;
  pagePath: string;
  sections: Section[];
}

// Add this helper function to convert prices from USD to INR
const convertToRupees = (dollarPrice: number) => {
  // Just return the original price without conversion
  return dollarPrice;
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [topSelling, setTopSelling] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [layoutData, setLayoutData] = useState<LayoutData | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  // Fetch the layout data
  useEffect(() => {
    const fetchLayoutData = async () => {
      try {
        debug('Fetching layout data for store page');
        // Use 'store' as the pageId, not 'home'
        const response = await fetch('/api/layout/page?pageId=store');
        
        if (!response.ok) {
          debug(`Failed to fetch layout data: ${response.status}`);
          // Fallback to home layout if store layout doesn't exist
          debug('Trying to fetch home layout as fallback');
          const homeResponse = await fetch('/api/layout/page?pageId=home');
          
          if (!homeResponse.ok) {
            debug('Failed to fetch home layout fallback');
            return;
          }
          
          const homeData = await homeResponse.json();
          debug('Home layout data received as fallback:', homeData);
          
          if (homeData.success && homeData.layout) {
            debug('Setting home layout data as fallback', homeData.layout);
            setLayoutData(homeData.layout);
          } else {
            debug('No home layout found as fallback');
          }
          
          return;
        }
        
        const data = await response.json();
        debug('Layout data received from API:', data);
        
        if (data.success && data.layout) {
          debug('Setting layout data from API response', data.layout);
          setLayoutData(data.layout);
        } else {
          debug('No layout found for store page, trying home as fallback');
          // Try fetching home layout as fallback
          const homeResponse = await fetch('/api/layout/page?pageId=home');
          
          if (homeResponse.ok) {
            const homeData = await homeResponse.json();
            if (homeData.success && homeData.layout) {
              debug('Using home layout as fallback', homeData.layout);
              setLayoutData(homeData.layout);
            }
          }
        }
      } catch (error) {
        debug('Error fetching layout:', error instanceof Error ? error.message : String(error));
      }
    };
    
    fetchLayoutData();
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        debug('Fetching products from API');
        // Fetch real products from API
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        debug('Products data received:', { count: data.products?.length || 0 });
        
        let products = data.products.map((product: any) => ({
          ...product,
          price: convertToRupees(product.price),
          discountedPrice: product.comparePrice ? convertToRupees(product.comparePrice) : 0,
          // Map MongoDB fields to store-expected fields
          featured: product.featured || false,
          new_arrival: product.isNewProduct || false, // Use isNewProduct from MongoDB
          best_seller: product.category.includes('Bestseller') || false,
          images: product.images && product.images.length > 0 
            ? product.images.map((img: string) => ({ url: img }))
            : [{ url: product.mainImage || 'https://placehold.co/400x500' }]
        }));
        
        setAllProducts(products);
        
        debug('Total products fetched:', products.length);
        
        // Filter products correctly by their flags - ensure boolean comparison
        const featured = products.filter((p: any) => p.featured === true);
        const newArrival = products.filter((p: any) => p.new_arrival === true || p.category.includes('New Arrival'));
        const bestSeller = products.filter((p: any) => p.best_seller === true || p.category.includes('Bestseller'));
        
        debug('Featured count:', featured.length);
        debug('New arrivals count:', newArrival.length);
        debug('Best sellers count:', bestSeller.length);
        
        // Set products for each section without fallbacks - only show products in their correct category
        setFeaturedProducts(featured);
        setNewArrivals(newArrival);
        setTopSelling(bestSeller);
        
      } catch (error) {
        debug('Failed to fetch products:', error instanceof Error ? error.message : String(error));
        // Use mock data as fallback only if API fails completely
        const mockProducts = [
          {
            _id: '1',
            name: 'Wild Escape',
            description: 'Citrus | Musk',
            price: 1699,
            discountedPrice: 1299,
            category: 'Citrus',
            images: [{ url: 'https://placehold.co/400x500/eee/000?text=Wild+Escape' }],
            rating: 4.5,
            featured: true,
            new_arrival: true,
            best_seller: false
          },
          {
            _id: '2',
            name: 'Baked Vanilla',
            description: 'Vanilla | Gourmand',
            price: 1699,
            discountedPrice: 1299,
            category: 'Vanilla',
            images: [{ url: 'https://placehold.co/400x500/eee/000?text=Baked+Vanilla' }],
            rating: 4.8,
            featured: true,
            new_arrival: false,
            best_seller: true
          },
          {
            _id: '3',
            name: 'Apple Lily',
            description: 'Citrus | Floral',
            price: 1699,
            discountedPrice: 1299,
            category: 'Floral',
            images: [{ url: 'https://placehold.co/400x500/eee/000?text=Apple+Lily' }],
            rating: 4.9,
            featured: false,
            new_arrival: true,
            best_seller: false
          },
          {
            _id: '4',
            name: 'Candy Babe',
            description: 'Fruity | Candy',
            price: 1699,
            discountedPrice: 1299,
            category: 'Fruity',
            images: [{ url: 'https://placehold.co/400x500/eee/000?text=Candy+Babe' }],
            rating: 4.2,
            featured: false,
            new_arrival: true,
            best_seller: false
          },
          {
            _id: '5',
            name: 'White Floral',
            description: 'Fresh | Floral',
            price: 1699,
            discountedPrice: 1299,
            category: 'Floral',
            images: [{ url: 'https://placehold.co/400x500/eee/000?text=White+Floral' }],
            rating: 4.6,
            featured: false,
            new_arrival: false,
            best_seller: true
          },
          {
            _id: '6',
            name: 'Devil\'s Berry',
            description: 'Dark Berry',
            price: 1699,
            discountedPrice: 1299,
            category: 'Fruity',
            images: [{ url: 'https://placehold.co/400x500/eee/000?text=Devils+Berry' }],
            rating: 4.4,
            featured: true,
            new_arrival: false,
            best_seller: true
          },
          {
            _id: '7',
            name: 'Oud Pataka',
            description: 'Sweet | Oud',
            price: 1699,
            discountedPrice: 1299,
            category: 'Oud',
            images: [{ url: 'https://placehold.co/400x500/eee/000?text=Oud+Pataka' }],
            rating: 4.1,
            featured: true,
            new_arrival: true,
            best_seller: false
          },
          {
            _id: '8',
            name: 'Uncensored Blue',
            description: 'Dark Blue | Woody',
            price: 1699,
            discountedPrice: 1299,
            category: 'Woody',
            images: [{ url: 'https://placehold.co/400x500/eee/000?text=Uncensored+Blue' }],
            rating: 4.7,
            featured: false,
            new_arrival: false,
            best_seller: true
          },
        ];
        
        setAllProducts(mockProducts);
        
        // Only set mock data if needed
        if (featuredProducts.length === 0) {
          setFeaturedProducts(mockProducts.filter(p => p.featured));
        }
        
        if (newArrivals.length === 0) {
          setNewArrivals(mockProducts.filter(p => p.new_arrival));
        }
        
        if (topSelling.length === 0) {
          setTopSelling(mockProducts.filter(p => p.best_seller));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Render a section based on its type and content
  const renderSection = (section: Section) => {
    debug('Rendering section:', { id: section.id, type: section.type, position: section.position });
    
    switch (section.type) {
      case 'product':
        debug('Rendering product section with products:', section.content.productIds);
        return (
          <section key={section.id} className="py-10 px-4 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">
              {section.content.title || 'Products'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {section.content.productIds?.map((productId: string) => {
                const product = allProducts.find(p => p._id === productId);
                debug('Found product for ID:', { productId, found: !!product });
                return product ? <ProductCard key={product._id} product={product} /> : null;
              })}
            </div>
          </section>
        );
        
      case 'image':
        debug('Rendering image section with image:', section.content.imageUrl);
        return (
          <section key={section.id} className="py-8 px-4 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium mb-6 text-center">
              {section.content.title || ''}
            </h2>
            <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden rounded-lg">
              <Image 
                src={section.content.imageUrl || 'https://placehold.co/1200x600'} 
                alt={section.content.title || 'Banner image'} 
                fill
                style={{ objectFit: 'cover' }}
              />
              {section.content.buttonText && section.content.buttonLink && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Link 
                    href={section.content.buttonLink} 
                    className="px-6 py-3 bg-black bg-opacity-80 text-white rounded hover:bg-opacity-90 transition duration-300"
                  >
                    {section.content.buttonText}
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
        
      case 'video':
        debug('Rendering video section with video:', section.content.videoUrl);
        return (
          <section key={section.id} className="py-8 px-4 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium mb-6 text-center">
              {section.content.title || ''}
            </h2>
            <div className="relative w-full aspect-video overflow-hidden rounded-lg">
              <video 
                src={section.content.videoUrl} 
                autoPlay 
                loop 
                muted={false}
                playsInline
                controls={false}
                className="w-full h-full object-cover"
                onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
                style={{ 
                  pointerEvents: 'none' // Disable interaction with the video
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </section>
        );
        
      case 'text':
        debug('Rendering text section');
        return (
          <section key={section.id} className="py-8 px-4 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium mb-4 text-center">
              {section.content.title || ''}
            </h2>
            <div className="prose max-w-3xl mx-auto" dangerouslySetInnerHTML={{__html: section.content.text || ''}} />
          </section>
        );
        
      case 'gallery':
        debug('Rendering gallery section with images count:', section.content.images?.length || 0);
        return (
          <section key={section.id} className="py-8 px-4 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium mb-6 text-center">
              {section.content.title || 'Gallery'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {section.content.mediaItems?.map((item: {url: string, caption?: string, type?: string}, idx: number) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-lg">
                  {item.type === 'video' ? (
                    <video 
                      src={item.url} 
                      autoPlay
                      loop
                      muted={false}
                      playsInline
                      controls={false}
                      className="w-full h-full object-cover"
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ pointerEvents: 'none' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image 
                      src={item.url || 'https://placehold.co/600x600'} 
                      alt={item.caption || `Gallery item ${idx + 1}`} 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
              ))}
              {/* Fallback for old format that only had images */}
              {!section.content.mediaItems && section.content.images?.map((image: {url: string, caption?: string}, idx: number) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image 
                    src={image.url || 'https://placehold.co/600x600'} 
                    alt={image.caption || `Gallery image ${idx + 1}`} 
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </section>
        );
        
      default:
        debug('Unknown section type:', section.type);
        return null;
    }
  };
  
  // Effect to log when layoutData changes
  useEffect(() => {
    debug('Layout data updated:', layoutData);
    if (layoutData?.sections) {
      debug('Number of sections:', layoutData.sections.length);
      layoutData.sections.forEach(section => {
        debug(`Section ${section.id}:`, { type: section.type, position: section.position });
      });
    }
  }, [layoutData]);
  
  return (
    <div className="pb-10 bg-white text-black">
      {/* Sale Carousel */}
      <SaleCarousel />
      
      {/* If we have layout data, render sections based on it */}
      {layoutData && layoutData.sections && layoutData.sections.length > 0 ? (
        // Sort sections by position and render each one
        <>
          {/* Debug statement outside JSX */}
          {(() => {
            debug('Rendering custom layout with sections:', layoutData.sections.length);
            return null;
          })()}
          
          {layoutData.sections
            .sort((a, b) => a.position - b.position)
            .map(section => renderSection(section))}
        </>
      ) : (
        // Fallback to default layout if no custom layout is found
        <>
          {/* Debug statement outside JSX */}
          {(() => {
            debug('No layout found, rendering default layout');
            return null;
          })()}
          
          {/* Featured Products */}
          <section className="py-10 px-4 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">Featured Products</h2>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.length > 0 ? (
                  featuredProducts.slice(0, 8).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500">No featured products available</p>
                )}
              </div>
            )}
            
            <div className="text-center mt-8">
              <Link href="/collection" className="inline-block border border-black px-6 py-2 hover:bg-black hover:text-white transition duration-300">
                View All Products
              </Link>
            </div>
          </section>
          
          {/* New Arrivals */}
          <section className="py-10 px-4 max-w-7xl mx-auto bg-gray-50">
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">New Arrivals</h2>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {newArrivals.length > 0 ? (
                  newArrivals.slice(0, 4).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500">No new arrivals available</p>
                )}
              </div>
            )}
            
            <div className="text-center mt-8">
              <Link href="/new-arrivals" className="inline-block border border-black px-6 py-2 hover:bg-black hover:text-white transition duration-300">
                View All New Arrivals
              </Link>
            </div>
          </section>
          
          {/* Top Selling */}
          <section className="py-10 px-4 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">Best Sellers</h2>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {topSelling.length > 0 ? (
                  topSelling.slice(0, 4).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500">No best sellers available</p>
                )}
              </div>
            )}
            
            <div className="text-center mt-8">
              <Link href="/collection" className="inline-block border border-black px-6 py-2 hover:bg-black hover:text-white transition duration-300">
                View All Best Sellers
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
} 