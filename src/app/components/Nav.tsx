'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FiUser, FiShoppingBag, FiHeart, FiSearch, FiLogOut, FiX, FiMenu, FiChevronDown } from 'react-icons/fi';
import { useAuth } from './AuthProvider';

// Define types for nav item settings
interface NavItem {
  id: string;
  name: string;
  enabled: boolean;
  path: string;
}

interface StoreComponent {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  
  // State for admin-configured settings
  const [navItems, setNavItems] = useState<Record<string, boolean>>({
    home: true,
    perfumes: true,
    discovery: true,
    bundle: true,
    gifting: true,
    combos: true,
    "new-arrivals": true,
    about: true,
    track: true
  });
  
  const [componentSettings, setComponentSettings] = useState<Record<string, boolean>>({
    announcement: true,
    search: true
  });
  
  // Load settings from localStorage
  useEffect(() => {
    try {
      // Load navigation settings
      const savedNavItems = localStorage.getItem('store_nav_settings');
      if (savedNavItems) {
        const parsedItems = JSON.parse(savedNavItems);
        const navMap: Record<string, boolean> = {};
        parsedItems.forEach((item: NavItem) => {
          navMap[item.id] = item.enabled;
        });
        setNavItems(navMap);
      }
      
      // Load component settings
      const savedComponents = localStorage.getItem('store_component_settings');
      if (savedComponents) {
        const parsedComponents = JSON.parse(savedComponents);
        const componentMap: Record<string, boolean> = {};
        parsedComponents.forEach((component: StoreComponent) => {
          componentMap[component.id] = component.enabled;
        });
        
        // Apply component settings (e.g., hide announcement bar if disabled)
        if (componentMap.announcement !== undefined) {
          setShowAnnouncement(componentMap.announcement);
        }
        
        setComponentSettings(componentMap);
      }
    } catch (error) {
      console.error('Error loading navigation settings:', error);
    }
  }, []);
  
  // Fetch cart items count
  useEffect(() => {
    const getCartCount = () => {
      try {
        const cart = localStorage.getItem('cart');
        if (cart) {
          const parsedCart = JSON.parse(cart);
          // Count total items including quantities
          const count = parsedCart.reduce((total: number, item: any) => total + item.quantity, 0);
          setCartItemsCount(count);
        } else {
          setCartItemsCount(0);
        }
      } catch (error) {
        console.error('Error parsing cart data:', error);
      }
    };
    
    getCartCount();
    window.addEventListener('storage', getCartCount);
    
    return () => {
      window.removeEventListener('storage', getCartCount);
    };
  }, []);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogoutClick = () => {
    // Show the custom logout confirmation modal
    setShowLogoutModal(true);
    // Close the account dropdown
    setAccountDropdownOpen(false);
  };
  
  const handleLogout = () => {
    // Close the modal
    setShowLogoutModal(false);
    
    // Use the logout function from auth context
    logout();
  };
  
  const cancelLogout = () => {
    // Close the modal without logging out
    setShowLogoutModal(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const toggleAccountDropdown = () => {
    setAccountDropdownOpen(!accountDropdownOpen);
  };
  
  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-80 p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Confirm Logout</h3>
              <button 
                onClick={cancelLogout}
                className="text-gray-400 hover:text-black"
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black text-white hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Announcement Bar - Only show if enabled in admin settings */}
      {showAnnouncement && componentSettings.announcement && (
        <div className="bg-black text-white py-2 overflow-hidden">
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap py-1 text-xs font-medium">
              <span className="mx-4">USE CODE SMELLGOOD5 FOR EXTRA 5% OFF ON ALL PREPAID ORDERS</span>
              <span className="mx-4">•</span>
              <span className="mx-4">USE CODE SMELLGOOD5 FOR EXTRA 5% OFF ON ALL PREPAID ORDERS</span>
              <span className="mx-4">•</span>
              <span className="mx-4">USE CODE SMELLGOOD5 FOR EXTRA 5% OFF ON ALL PREPAID ORDERS</span>
            </div>
            <div className="absolute top-0 animate-marquee whitespace-nowrap py-1 text-xs font-medium" style={{ animationDelay: '1.s' }}>
              <span className="mx-4">USE CODE SMELLGOOD5 FOR EXTRA 5% OFF ON ALL PREPAID ORDERS</span>
              <span className="mx-4">•</span>
              <span className="mx-4">USE CODE SMELLGOOD5 FOR EXTRA 5% OFF ON ALL PREPAID ORDERS</span>
              <span className="mx-4">•</span>
              <span className="mx-4">USE CODE SMELLGOOD5 FOR EXTRA 5% OFF ON ALL PREPAID ORDERS</span>
            </div>
          </div>
          <button 
            onClick={() => setShowAnnouncement(false)}
            className="absolute right-4 top-2 text-white z-10"
            aria-label="Close announcement"
          >
            <FiX size={18} />
          </button>
        </div>
      )}
      
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          {/* Top Navigation Bar */}
          <div className="flex justify-between items-center py-4">
            {/* Search Icon */}
            <div className="w-1/3 flex items-center">
              <button 
                onClick={toggleSearch}
                className="text-black p-2"
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>
            </div>
            
            {/* Logo */}
            <div className="w-1/3 flex justify-center">
              <Link href="/" className="text-2xl font-bold tracking-wider uppercase">
                FRAGANOTE
              </Link>
            </div>
            
            {/* User Icons */}
            <div className="w-1/3 flex items-center justify-end space-x-4">
              {/* Account dropdown for logged-in users */}
              {isAuthenticated ? (
                <div className="relative" ref={accountDropdownRef}>
                  <button 
                    onClick={toggleAccountDropdown}
                    className="flex items-center p-2 text-gray-600 hover:text-black"
                    aria-label="Account"
                  >
                    <FiUser size={20} />
                    <FiChevronDown size={16} className={`ml-1 transition-transform ${accountDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {accountDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="p-3 border-b border-gray-100">
                        <p className="font-medium text-sm">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                      </div>
                      <div className="py-1">
                        <Link 
                          href="/account" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link 
                          href="/account/orders" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link 
                          href="/account/wishlist" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          My Wishlist
                        </Link>
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <FiLogOut size={16} className="mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className={`p-2 ${pathname === '/login' ? 'text-black' : 'text-gray-600'}`}
                  aria-label="Login"
                >
                  <FiUser size={20} />
                </Link>
              )}
              
              {/* Only show wishlist button for logged-in users */}
              {isAuthenticated && (
                <Link 
                  href="/account/wishlist"
                  className={`p-2 ${pathname === '/account/wishlist' ? 'text-black' : 'text-gray-600'}`}
                  aria-label="Wishlist"
                >
                  <FiHeart size={20} />
                </Link>
              )}
              
              <Link 
                href="/cart" 
                className={`p-2 relative ${pathname === '/cart' ? 'text-black' : 'text-gray-600'}`}
                aria-label="Cart"
              >
                <FiShoppingBag size={20} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                  </span>
                )}
              </Link>
              
              <button 
                className="md:hidden p-2 text-black"
                onClick={toggleMobileMenu}
                aria-label="Menu"
              >
                <FiMenu size={24} />
              </button>
            </div>
          </div>
          
          {/* Main Navigation Menu - Only show items enabled in admin settings */}
          <nav className="hidden md:flex justify-center items-center space-x-8 py-4 border-t border-gray-200">
            {navItems.home && (
              <Link 
                href="/" 
                className={`text-sm font-medium uppercase tracking-wider ${
                  pathname === '/' || pathname === '/store'
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Home Page
              </Link>
            )}
            
            {navItems.perfumes && (
              <Link 
                href="/collection" 
                className={`text-sm font-medium uppercase tracking-wider ${
                  pathname === '/collection' || pathname.startsWith('/product') 
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Perfumes
              </Link>
            )}
            
            {navItems.discovery && (
              <Link 
                href="/discovery-set" 
                className={`text-sm font-medium uppercase tracking-wider ${
                  pathname === '/discovery-set'  
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Discovery Set
              </Link>
            )}
            
            {navItems.bundle && (
              <Link 
                href="/bundle" 
                className={`text-sm font-medium uppercase tracking-wider ${
                  pathname === '/bundle'  
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Make My Bundle
              </Link>
            )}
            
            {navItems.gifting && (
              <Link 
                href="/gifting" 
                className={`text-sm font-medium uppercase tracking-wider ${
                  pathname === '/gifting'  
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Gifting
              </Link>
            )}
            
            {navItems.combos && (
              <Link 
                href="/combos" 
                className={`text-sm font-medium uppercase tracking-wider ${
                  pathname === '/combos'  
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Combos
              </Link>
            )}
            
            {navItems["new-arrivals"] && (
              <Link 
                href="/new-arrivals" 
                className={`text-sm font-medium uppercase tracking-wider ${
                  pathname === '/new-arrivals'  
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                New Arrivals
              </Link>
            )}
            
            {navItems.about && (
              <Link 
                href="/about-us" 
                className={`text-sm font-medium uppercase tracking-wider ${
                  pathname === '/about-us'  
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                About Us
              </Link>
            )}
            
            {/* Only show Track My Order for logged-in users */}
            {isAuthenticated && navItems.track && (
              <Link 
                href="/track-order" 
                className={`text-sm font-medium uppercase tracking-wider ${
                  pathname === '/track-order'  
                    ? 'text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Track My Order
              </Link>
            )}
          </nav>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navItems.home && (
                  <Link 
                    href="/" 
                    className={`text-sm font-medium uppercase py-2 ${
                      pathname === '/' || pathname.startsWith('/store') 
                        ? 'text-black' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home Page
                  </Link>
                )}
                {navItems.perfumes && (
                  <Link 
                    href="/collection" 
                    className={`text-sm font-medium uppercase py-2 ${
                      pathname === '/collection' || pathname.startsWith('/product') 
                        ? 'text-black' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Perfumes
                  </Link>
                )}
                {navItems.discovery && (
                  <Link 
                    href="/discovery-set" 
                    className={`text-sm font-medium uppercase py-2 ${
                      pathname === '/discovery-set'  
                        ? 'text-black' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Discovery Set
                  </Link>
                )}
                {navItems.bundle && (
                  <Link 
                    href="/bundle" 
                    className={`text-sm font-medium uppercase py-2 ${
                      pathname === '/bundle'  
                        ? 'text-black' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Make My Bundle
                  </Link>
                )}
                {navItems.gifting && (
                  <Link 
                    href="/gifting" 
                    className={`text-sm font-medium uppercase py-2 ${
                      pathname === '/gifting'  
                        ? 'text-black' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Gifting
                  </Link>
                )}
                {navItems.combos && (
                  <Link 
                    href="/combos" 
                    className={`text-sm font-medium uppercase py-2 ${
                      pathname === '/combos'  
                        ? 'text-black' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Combos
                  </Link>
                )}
                {navItems["new-arrivals"] && (
                  <Link 
                    href="/new-arrivals" 
                    className={`text-sm font-medium uppercase py-2 ${
                      pathname === '/new-arrivals'  
                        ? 'text-black' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    New Arrivals
                  </Link>
                )}
                {navItems.about && (
                  <Link 
                    href="/about-us" 
                    className={`text-sm font-medium uppercase py-2 ${
                      pathname === '/about-us'  
                        ? 'text-black' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                )}
                
                {/* Only show Track My Order for logged-in users in mobile menu */}
                {isAuthenticated && navItems.track && (
                  <Link 
                    href="/track-order" 
                    className={`text-sm font-medium uppercase py-2 ${
                      pathname === '/track-order'  
                        ? 'text-black' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Track My Order
                  </Link>
                )}
                
                <Link 
                  href={isAuthenticated ? "/account" : "/login"}
                  className="text-sm font-medium uppercase py-2 text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                
                {/* Only show wishlist in mobile menu for logged-in users */}
                {isAuthenticated && (
                  <Link 
                    href="/account/wishlist"
                    className={`text-sm font-medium uppercase py-2 ${
                      pathname === '/account/wishlist' 
                        ? 'text-black' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Wishlist
                  </Link>
                )}
                
                <Link
                  href="/cart"
                  className="text-sm font-medium uppercase py-2 text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Cart
                </Link>
                
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogoutClick();
                    }}
                    className="text-sm font-medium uppercase py-2 text-gray-600 text-left"
                  >
                    Logout
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}
        
        {/* Search overlay */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-[100px] bg-white border-t border-gray-200 p-4 shadow-md z-10">
            <div className="container mx-auto relative">
              <form className="flex items-center">
                <input 
                  type="text" 
                  placeholder="Search our store" 
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                />
                <button type="submit" className="ml-2 p-2 bg-black text-white">
                  <FiSearch size={20} />
                </button>
              </form>
              <button 
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 top-2 text-gray-500 hover:text-black"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
} 