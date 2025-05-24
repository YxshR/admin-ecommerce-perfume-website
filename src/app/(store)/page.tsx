'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiShoppingBag } from 'react-icons/fi';

interface StoreComponent {
  id: string;
  enabled: boolean;
}

// Sample product data
const featuredProducts = [
  {
    id: '1',
    name: 'Mystic Ocean',
    category: 'His',
    price: 1499,
    image: 'https://placehold.co/300x400/272420/FFFFFF/png?text=Mystic+Ocean'
  },
  {
    id: '2',
    name: 'Elegant Rose',
    category: 'Her',
    price: 1699,
    image: 'https://placehold.co/300x400/272420/FFFFFF/png?text=Elegant+Rose'
  },
  {
    id: '3',
    name: 'Urban Spice',
    category: 'Unisex',
    price: 1899,
    image: 'https://placehold.co/300x400/272420/FFFFFF/png?text=Urban+Spice'
  },
  {
    id: '4',
    name: 'Midnight Dreams',
    category: 'His',
    price: 2099,
    image: 'https://placehold.co/300x400/272420/FFFFFF/png?text=Midnight+Dreams'
  },
  {
    id: '5',
    name: 'Summer Breeze',
    category: 'Her',
    price: 1599,
    image: 'https://placehold.co/300x400/272420/FFFFFF/png?text=Summer+Breeze'
  },
  {
    id: '6',
    name: 'Amber Wood',
    category: 'Unisex',
    price: 1799,
    image: 'https://placehold.co/300x400/272420/FFFFFF/png?text=Amber+Wood'
  },
];

const categories = [
  { id: 'him', name: 'For Him', image: 'https://placehold.co/600x400/272420/FFFFFF/png?text=For+Him' },
  { id: 'her', name: 'For Her', image: 'https://placehold.co/600x400/272420/FFFFFF/png?text=For+Her' },
  { id: 'unisex', name: 'Unisex', image: 'https://placehold.co/600x400/272420/FFFFFF/png?text=Unisex' }
];

export default function StorePage() {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  // State for component visibility based on admin settings
  const [componentSettings, setComponentSettings] = useState({
    hero: true,
    featured: true,
    categories: true,
    bestsellers: true,
    testimonials: true,
    newsletter: true
  });

  useEffect(() => {
    // Load wishlist items from localStorage
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        const wishlistData = JSON.parse(storedWishlist);
        setWishlistItems(wishlistData.map((item: any) => item.productId));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }, []);

  // Load component settings
  useEffect(() => {
    try {
      const savedComponents = localStorage.getItem('store_component_settings');
      if (savedComponents) {
        const parsedComponents = JSON.parse(savedComponents);
        const componentMap: Record<string, boolean> = {};
        
        parsedComponents.forEach((component: StoreComponent) => {
          componentMap[component.id] = component.enabled;
        });
        
        setComponentSettings(prev => ({
          ...prev,
          ...componentMap
        }));
      }
    } catch (error) {
      console.error('Error loading component settings:', error);
    }
  }, []);

  const addToWishlist = (product: any) => {
    try {
      // Get existing wishlist
      const storedWishlist = localStorage.getItem('wishlist');
      let wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
      
      // Check if product is already in wishlist
      const existingItem = wishlist.find((item: any) => item.productId === product.id);
      
      if (!existingItem) {
        // Add to wishlist
        wishlist.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          addedAt: new Date().toISOString()
        });
        
        // Update localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        // Update state
        setWishlistItems([...wishlistItems, product.id]);
        
        // Show confirmation
        alert('Product added to wishlist!');
      } else {
        // Remove from wishlist
        wishlist = wishlist.filter((item: any) => item.productId !== product.id);
        
        // Update localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        // Update state
        setWishlistItems(wishlistItems.filter(id => id !== product.id));
        
        // Show confirmation
        alert('Product removed from wishlist!');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const addToCart = (product: any) => {
    try {
      // Get existing cart
      const storedCart = localStorage.getItem('cart');
      let cart = storedCart ? JSON.parse(storedCart) : [];
      
      // Check if product is already in cart
      const existingItemIndex = cart.findIndex((item: any) => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // If product exists, increase quantity
        cart[existingItemIndex].quantity += 1;
      } else {
        // Otherwise add new item
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        });
      }
      
      // Save updated cart
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Trigger storage event for other components
      window.dispatchEvent(new Event('storage'));
      
      // Show confirmation
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner - Only show if enabled in admin settings */}
      {componentSettings.hero && (
        <div className="relative h-[500px] mb-16 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
          <img 
            src="https://placehold.co/1200x500/272420/FFFFFF/png?text=Luxury+Fragrances" 
            alt="Luxury Fragrances" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4">
              Premium Fragrances<br />Crafted for Excellence
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-md">
              Discover our exclusive collection of luxury perfumes designed to captivate the senses.
            </p>
            <div>
              <Link 
                href="/collection" 
                className="inline-block bg-white text-black px-8 py-3 font-medium hover:bg-gray-100"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Featured Products - Only show if enabled in admin settings */}
      {componentSettings.featured && (
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-medium">Featured Products</h2>
            <div className="w-20 h-1 bg-black mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="relative overflow-hidden mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                    <FiShoppingBag className="mr-2" /> Add to Cart
                  </button>
                </div>
                <div className="text-center">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                  <p className="font-medium">₹{product.price}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link 
              href="/collection" 
              className="inline-block border border-black text-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      )}
      
      {/* Categories - Only show if enabled in admin settings */}
      {componentSettings.categories && (
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-medium">Shop by Category</h2>
            <div className="w-20 h-1 bg-black mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/collection/${category.id}`} className="group block relative overflow-hidden h-[300px]">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-serif">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Testimonials - Only show if enabled in admin settings */}
      {componentSettings.testimonials && (
        <div className="mb-16 bg-gray-50 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-medium">Customer Reviews</h2>
            <div className="w-20 h-1 bg-black mx-auto mt-4"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <p className="text-xl italic mb-6">"The fragrances are absolutely amazing. I've been using Mystic Ocean for months now and I always get compliments. The scent lasts all day!"</p>
              <div className="flex justify-center items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div className="ml-4 text-left">
                  <p className="font-medium">Rahul Sharma</p>
                  <p className="text-sm text-gray-500">Verified Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Newsletter - Only show if enabled in admin settings */}
      {componentSettings.newsletter && (
        <div className="mb-16">
          <div className="bg-gray-900 text-white py-16 px-4 md:px-8 text-center">
            <h2 className="text-3xl font-serif font-medium mb-4">Join Our Newsletter</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about new product launches, exclusive offers, and fragrance tips.
            </p>
            <form className="max-w-md mx-auto flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-3 bg-white text-black focus:outline-none"
                required
              />
              <button 
                type="submit" 
                className="bg-black border border-black text-white px-6 py-3 font-medium hover:bg-gray-800"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 