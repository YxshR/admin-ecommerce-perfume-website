'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiShoppingBag, FiHeart, FiStar, FiArrowLeft } from 'react-icons/fi';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  category: string;
  brand: string;
  images: { url: string }[];
  stock: number;
  fragrance_notes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  concentration?: string;
  size?: number;
  gender?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  // Check user login status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // If user is logged in, check if product is in wishlist
    if (token) {
      checkWishlistStatus();
    }
  }, []);
  
  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        
        // In a real app, you would fetch from an API
        // For now, using mock data for demonstration
        const mockProduct = {
          _id: id as string,
          name: 'Wild Escape Perfume',
          description: 'A captivating blend that transports you to a lush forest after rainfall. This enchanting fragrance combines fresh green notes with earthy undertones for a truly immersive experience.',
          price: 1499,
          discountedPrice: 1299,
          category: 'Woody',
          brand: 'Fraganote',
          stock: 10,
          images: [
            { url: 'https://placehold.co/600x800/222/fff?text=Wild+Escape' },
            { url: 'https://placehold.co/600x800/333/fff?text=Product+Side' },
            { url: 'https://placehold.co/600x800/444/fff?text=Product+Back' },
          ],
          fragrance_notes: {
            top: ['Bergamot', 'Lemon', 'Green Apple'],
            middle: ['Pine', 'Cedar', 'Lavender'],
            base: ['Sandalwood', 'Musk', 'Amber']
          },
          concentration: 'Eau de Parfum',
          size: 50,
          gender: 'Unisex'
        };
        
        setProduct(mockProduct);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchProduct();
    }
  }, [id]);
  
  // Check if product is in user's wishlist
  const checkWishlistStatus = async () => {
    // In a real app, you would fetch the user's wishlist from an API
    // For now, using localStorage to simulate the functionality
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsWishlisted(wishlist.some((item: any) => item.productId === id));
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };
  
  // Handle add to wishlist
  const handleToggleWishlist = async () => {
    if (!isLoggedIn) {
      // Redirect to login page if user is not logged in
      router.push('/account/login?redirect=/product/' + id);
      return;
    }
    
    setIsAddingToWishlist(true);
    
    try {
      // In a real app, you would call an API to update the wishlist
      // For now, using localStorage to simulate the functionality
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      if (isWishlisted) {
        // Remove from wishlist
        const updatedWishlist = wishlist.filter((item: any) => item.productId !== id);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        setIsWishlisted(false);
      } else {
        // Add to wishlist
        if (product) {
          const wishlistItem = {
            productId: id,
            name: product.name,
            price: product.discountedPrice > 0 ? product.discountedPrice : product.price,
            image: product.images[0]?.url || '',
            addedAt: new Date().toISOString()
          };
          wishlist.push(wishlistItem);
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
          setIsWishlisted(true);
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    // Get existing cart from localStorage
    let cart = [];
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        cart = JSON.parse(savedCart);
      }
    } catch (error) {
      console.error('Error parsing cart:', error);
    }
    
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex((item: any) => item.id === product._id);
    
    if (existingItemIndex >= 0) {
      // If product exists, increase quantity
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Otherwise add new item
      cart.push({
        id: product._id,
        name: product.name,
        price: product.discountedPrice > 0 ? product.discountedPrice : product.price,
        image: product.images[0]?.url || '',
        quantity: quantity
      });
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
    
    // Optionally redirect to cart or show confirmation
    alert('Product added to cart!');
  };
  
  // Calculate discount percentage
  const discount = product && product.discountedPrice > 0 && product.price > 0
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {error || 'Product not found'}
          </h2>
          <Link href="/" className="mt-4 inline-block text-black underline">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-500 hover:text-black">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-500 mx-2">/</span>
            </li>
            <li>
              <Link href={`/category/${product.category.toLowerCase()}`} className="text-gray-500 hover:text-black">
                {product.category}
              </Link>
            </li>
            <li>
              <span className="text-gray-500 mx-2">/</span>
            </li>
            <li className="text-black font-medium truncate max-w-[180px]">
              {product.name}
            </li>
          </ol>
        </nav>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main image */}
            <div className="border border-gray-200 overflow-hidden aspect-square">
              <img 
                src={product.images[selectedImage]?.url || 'https://placehold.co/800x800'} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image thumbnails */}
            {product.images.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button 
                    key={index}
                    className={`border ${selectedImage === index ? 'border-black' : 'border-gray-200'} w-24 h-24 flex-shrink-0`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image.url} 
                      alt={`${product.name} - View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-medium text-black">{product.name}</h1>
              <div className="text-sm text-gray-500 mt-1">{product.brand} | {product.concentration}</div>
            </div>
            
            {/* Price */}
            <div className="flex items-center flex-wrap">
              {product.discountedPrice > 0 ? (
                <>
                  <span className="text-2xl font-medium text-black mr-3">₹{product.discountedPrice.toFixed(2)}</span>
                  <span className="text-sm text-gray-500 line-through mr-3">MRP ₹{product.price.toFixed(2)}</span>
                  {discount > 0 && <span className="text-sm text-green-700">({discount}% OFF)</span>}
                </>
              ) : (
                <span className="text-2xl font-medium text-black">₹{product.price.toFixed(2)}</span>
              )}
            </div>
            
            {/* Stock status */}
            <div>
              {product.stock > 0 ? (
                <span className="text-sm font-medium text-green-700">In Stock</span>
              ) : (
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              )}
            </div>
            
            {/* Quantity selector */}
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-3">Quantity</span>
              <div className="flex border border-gray-300">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 border-r border-gray-300"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max={product.stock}
                  value={quantity} 
                  onChange={e => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-12 text-center py-1 focus:outline-none"
                />
                <button 
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="px-3 py-1 border-l border-gray-300"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col space-y-3">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="bg-black text-white py-3 px-6 hover:bg-gray-900 disabled:bg-gray-400"
              >
                <span className="flex items-center justify-center">
                  <FiShoppingBag className="mr-2" />
                  Add to Cart
                </span>
              </button>
              
              <button 
                onClick={handleToggleWishlist}
                disabled={isAddingToWishlist}
                className="border border-black py-3 px-6 hover:bg-gray-100"
              >
                <span className="flex items-center justify-center">
                  <FiHeart className={`mr-2 ${isWishlisted ? 'text-red-500 fill-current' : ''}`} />
                  {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </span>
              </button>
            </div>
            
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium uppercase mb-2">Description</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
            
            {/* Fragrance Notes */}
            {product.fragrance_notes && (
              <div>
                <h3 className="text-sm font-medium uppercase mb-2">Fragrance Notes</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs text-gray-500">Top Notes</h4>
                    <ul className="mt-1 text-sm">
                      {product.fragrance_notes.top.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500">Middle Notes</h4>
                    <ul className="mt-1 text-sm">
                      {product.fragrance_notes.middle.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500">Base Notes</h4>
                    <ul className="mt-1 text-sm">
                      {product.fragrance_notes.base.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium uppercase mb-3">Product Details</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-2 text-gray-500">Size</td>
                    <td className="py-2">{product.size} ml</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Concentration</td>
                    <td className="py-2">{product.concentration}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Gender</td>
                    <td className="py-2">{product.gender}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Category</td>
                    <td className="py-2">{product.category}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Brand</td>
                    <td className="py-2">{product.brand}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 