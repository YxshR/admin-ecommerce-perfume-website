'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ShopNowButton from './ui/ShopNowButton';

// Types
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  images: { url: string }[];
}

// Convert USD to INR
const convertToRupees = (dollarPrice: number) => {
  // Just return the original price without conversion
  return dollarPrice;
};

export default function SaleCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch products with 50% off
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        // Filter for products with 50% discount and convert prices to rupees
        const saleProducts = data.products.filter((product: Product) => {
          // Convert prices to rupees
          product.price = convertToRupees(product.price);
          product.discountedPrice = product.discountedPrice ? convertToRupees(product.discountedPrice) : 0;
          
          return product.discountedPrice > 0 && 
            ((product.price - product.discountedPrice) / product.price * 100) >= 30;
        });
        
        setProducts(saleProducts);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };
  
  // Auto advance slides every 5 seconds
  useEffect(() => {
    if (products.length <= 1) return;
    
    const timer = setInterval(() => {
      goToNext();
    }, 5000);
    
    return () => clearInterval(timer);
  }, [products, currentIndex]);
  
  // Mock data in case no products with discount are found
  const mockProducts: Product[] = [
    {
      _id: 'mock1',
      name: 'Wild Escape',
      description: 'Citrus | Musk',
      price: convertToRupees(1699),
      discountedPrice: convertToRupees(1299),
      images: [{ url: 'https://placehold.co/1200x600/eee/000?text=Wild+Escape' }]
    },
    {
      _id: 'mock2',
      name: 'Baked Vanilla',
      description: 'Vanilla | Gourmand',
      price: convertToRupees(1699),
      discountedPrice: convertToRupees(1299),
      images: [{ url: 'https://placehold.co/1200x600/eee/000?text=Baked+Vanilla' }]
    },
    {
      _id: 'mock3',
      name: 'Devil\'s Berry',
      description: 'Dark Berry',
      price: convertToRupees(1699),
      discountedPrice: convertToRupees(1299),
      images: [{ url: 'https://placehold.co/1200x600/eee/000?text=Devils+Berry' }]
    }
  ];
  
  // Use mock data if no products found or loading
  const displayProducts = products.length > 0 ? products : mockProducts;
  
  if (loading && displayProducts.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-lg">Loading fragrances...</div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-[350px] sm:h-[400px] md:h-[500px] overflow-hidden bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          {displayProducts[currentIndex] && (
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              {/* Image */}
              <div className="order-2 md:order-1 flex items-center justify-center h-full bg-gray-100">
                <img
                  src={displayProducts[currentIndex].images[0]?.url || '/perfume-placeholder.jpg'}
                  alt={displayProducts[currentIndex].name}
                  className="object-contain h-4/5 max-h-full"
                />
              </div>
              
              {/* Content */}
              <div className="order-1 md:order-2 flex flex-col items-center justify-center p-4 md:p-8">
                <div className="text-center space-y-2 md:space-y-4 max-w-sm mx-auto">
                  <div className="bg-black text-white inline-block px-3 py-1 text-xs uppercase tracking-wider mb-2">
                    On Sale
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{displayProducts[currentIndex].name}</h2>
                  <p className="text-sm text-gray-600">{displayProducts[currentIndex].description}</p>
                  
                  <div className="flex items-center justify-center mt-2 md:mt-4 space-x-4">
                    <span className="text-lg sm:text-xl font-bold">₹{displayProducts[currentIndex].discountedPrice.toFixed(0)}</span>
                    <span className="text-sm text-gray-500 line-through">MRP ₹{displayProducts[currentIndex].price.toFixed(0)}</span>
                  </div>
                  
                  <div className="mt-4 md:mt-6">
                    <ShopNowButton href={`/product/${displayProducts[currentIndex]._id}`} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation arrows */}
      {displayProducts.length > 1 && (
        <>
          <button 
            onClick={goToPrev}
            className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 z-20 bg-white/80 text-black p-2 rounded-full shadow-md hover:bg-white"
            aria-label="Previous product"
          >
            <FiChevronLeft size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={goToNext}
            className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 z-20 bg-white/80 text-black p-2 rounded-full shadow-md hover:bg-white"
            aria-label="Next product"
          >
            <FiChevronRight size={16} className="sm:w-5 sm:h-5" />
          </button>
        </>
      )}
      
      {/* Dots indicator */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 z-20">
        {displayProducts.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all ${
              i === currentIndex ? 'bg-black' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}