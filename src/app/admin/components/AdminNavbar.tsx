'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiBox, 
  FiShoppingBag, 
  FiUsers, 
  FiLogOut, 
  FiSettings, 
  FiBarChart2,
  FiLayers,
  FiMenu,
  FiX
} from 'react-icons/fi';

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('Admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    try {
      // Get user data from localStorage
      const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userData='))
        ?.split('=')[1];
        
      if (userDataCookie) {
        const userData = JSON.parse(decodeURIComponent(userDataCookie));
        if (userData && userData.role === 'admin') {
          setIsAdmin(true);
          setUserName(userData.name || 'Admin');
        } else {
          // Not an admin user, redirect to login
          router.push('/admin/login');
        }
      } else {
        // No user data, redirect to login
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Error checking admin auth:', error);
      // On error, keep the user on the page but assume they're not an admin
    }
  }, [router]);
  
  const handleLogout = () => {
    try {
      // Remove cookies
      document.cookie = 'isLoggedIn=; Path=/; Max-Age=0; SameSite=Lax';
      document.cookie = 'userData=; Path=/; Max-Age=0; SameSite=Lax';
      document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax';
    } catch (error) {
      console.error('Error clearing cookies:', error);
    }
    
    router.push('/admin/login');
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Check if a path is active (for highlighting the current section)
  const isActivePath = (path: string) => {
    if (!pathname) return false;
    
    if (path === '/admin/dashboard') {
      return pathname === '/admin/dashboard';
    }
    
    return pathname.startsWith(path);
  };
  
  // Skip rendering the navbar on the login page
  if (pathname === '/admin/login') {
    return null;
  }
  
  return (
    <>
      {/* Mobile menu toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-50 flex items-center justify-between p-4 shadow-md">
        <div className="font-bold text-xl text-blue-600">Fraganote Admin</div>
        <button 
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
      
      {/* Sidebar for desktop */}
      <div className="hidden md:block fixed w-64 bg-white h-screen shadow-lg">
        <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800">
          <h2 className="text-xl font-bold text-white">Fraganote Admin</h2>
          <p className="text-blue-100 text-sm mt-1">Welcome, {userName}</p>
        </div>
        
        <nav className="mt-6">
          <Link 
            href="/admin/dashboard" 
            className={`block py-3 px-4 font-medium hover:bg-gray-100 transition-colors ${
              isActivePath('/admin/dashboard') 
                ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <FiBarChart2 className="mr-3" /> Dashboard
            </div>
          </Link>
          
          <Link 
            href="/admin/products" 
            className={`block py-3 px-4 font-medium hover:bg-gray-100 transition-colors ${
              isActivePath('/admin/products') 
                ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Products
            </div>
          </Link>
          
          <Link 
            href="/admin/orders" 
            className={`block py-3 px-4 font-medium hover:bg-gray-100 transition-colors ${
              isActivePath('/admin/orders') 
                ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <FiBox className="mr-3" /> Orders
            </div>
          </Link>
          
          <Link 
            href="/admin/users" 
            className={`block py-3 px-4 font-medium hover:bg-gray-100 transition-colors ${
              isActivePath('/admin/users') 
                ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <FiUsers className="mr-3" /> Users
            </div>
          </Link>
          
          <Link 
            href="/admin/settings" 
            className={`block py-3 px-4 font-medium hover:bg-gray-100 transition-colors ${
              isActivePath('/admin/settings') 
                ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <FiSettings className="mr-3" /> Settings
            </div>
          </Link>
          
          <div className="border-t border-gray-200 mt-6 pt-4">
            <button
              onClick={handleLogout}
              className="block w-full text-left py-3 px-4 font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center">
                <FiLogOut className="mr-3" /> Logout
              </div>
            </button>
          </div>
        </nav>
      </div>
      
      {/* Mobile sidebar (visible only when menu is open) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu}>
          <div className="bg-white h-screen w-64 shadow-lg pt-16" onClick={(e) => e.stopPropagation()}>
            <nav className="mt-2">
              <Link 
                href="/admin/dashboard" 
                className={`block py-3 px-4 font-medium hover:bg-gray-100 transition-colors ${
                  isActivePath('/admin/dashboard') 
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiBarChart2 className="mr-3" /> Dashboard
                </div>
              </Link>
              
              <Link 
                href="/admin/products" 
                className={`block py-3 px-4 font-medium hover:bg-gray-100 transition-colors ${
                  isActivePath('/admin/products') 
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiShoppingBag className="mr-3" /> Products
                </div>
              </Link>
              
              <Link 
                href="/admin/orders" 
                className={`block py-3 px-4 font-medium hover:bg-gray-100 transition-colors ${
                  isActivePath('/admin/orders') 
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiBox className="mr-3" /> Orders
                </div>
              </Link>
              
              <Link 
                href="/admin/users" 
                className={`block py-3 px-4 font-medium hover:bg-gray-100 transition-colors ${
                  isActivePath('/admin/users') 
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiUsers className="mr-3" /> Users
                </div>
              </Link>
              
              <Link 
                href="/admin/settings" 
                className={`block py-3 px-4 font-medium hover:bg-gray-100 transition-colors ${
                  isActivePath('/admin/settings') 
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiSettings className="mr-3" /> Settings
                </div>
              </Link>
              
              <div className="border-t border-gray-200 mt-6 pt-4">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-3 px-4 font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center">
                    <FiLogOut className="mr-3" /> Logout
                  </div>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
      
      {/* Content padding for desktop */}
      <div className="hidden md:block md:pl-64">
        {/* This provides space for the fixed sidebar */}
      </div>
      
      {/* Content padding for mobile */}
      <div className="md:hidden pt-16">
        {/* This provides space for the fixed mobile header */}
      </div>
    </>
  );
} 