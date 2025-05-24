'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '../../components/store/ProductCard';
import SaleCarousel from '../../components/SaleCarousel';

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
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch real products from API
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        let products = data.products.map((product: any) => ({
          ...product,
          price: convertToRupees(product.price),
          discountedPrice: product.discountedPrice ? convertToRupees(product.discountedPrice) : 0
        }));
        
        console.log('Total products fetched:', products.length);
        
        // Filter products correctly by their flags - ensure boolean comparison
        const featured = products.filter((p: any) => p.featured === true);
        const newArrival = products.filter((p: any) => p.new_arrival === true);
        const bestSeller = products.filter((p: any) => p.best_seller === true);
        
        console.log('Featured count:', featured.length);
        console.log('New arrivals count:', newArrival.length);
        console.log('Best sellers count:', bestSeller.length);
        
        // Set products for each section without fallbacks - only show products in their correct category
        setFeaturedProducts(featured);
        setNewArrivals(newArrival);
        setTopSelling(bestSeller);
        
      } catch (error) {
        console.error('Failed to fetch products:', error);
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
  
  return (
    <div className="pb-10 bg-white text-black">
      {/* Sale Carousel */}
      <SaleCarousel />
      
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
      
      {/* Best Selling */}
      <section className="py-10 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">Best Selling</h2>
        
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
              <p className="col-span-full text-center text-gray-500">No best selling products available</p>
            )}
          </div>
        )}
      </section>
      
      {/* About Section */}
      <section className="py-10 px-4 max-w-7xl mx-auto bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-medium mb-4">About Fraganote</h2>
          <p className="text-gray-600 mb-6">
            Fraganote is a premium fragrance brand that offers high-quality perfumes inspired by the world's most iconic scents.
            Our products are crafted with the finest ingredients to ensure long-lasting wear and exceptional quality.
          </p>
          <Link href="/about-us" className="inline-block border border-black px-6 py-2 hover:bg-black hover:text-white transition duration-300">
            Learn More
          </Link>
        </div>
      </section>
    </div>
  );
} 