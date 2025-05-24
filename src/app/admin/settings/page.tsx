'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiLogOut, FiSettings, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';

// Define types for our component configs
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

export default function AdminSettings() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // State for navigation items
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: 'home', name: 'Home Page', enabled: true, path: '/' },
    { id: 'perfumes', name: 'Perfumes', enabled: true, path: '/collection' },
    { id: 'discovery', name: 'Discovery Set', enabled: true, path: '/discovery-set' },
    { id: 'bundle', name: 'Make My Bundle', enabled: true, path: '/bundle' },
    { id: 'gifting', name: 'Gifting', enabled: true, path: '/gifting' },
    { id: 'combos', name: 'Combos', enabled: true, path: '/combos' },
    { id: 'new-arrivals', name: 'New Arrivals', enabled: true, path: '/new-arrivals' },
    { id: 'about', name: 'About Us', enabled: true, path: '/about-us' },
    { id: 'track', name: 'Track My Order', enabled: true, path: '/track-order' },
  ]);
  
  // State for store page components
  const [storeComponents, setStoreComponents] = useState<StoreComponent[]>([
    { id: 'hero', name: 'Hero Banner', enabled: true, description: 'Main banner on the homepage' },
    { id: 'featured', name: 'Featured Products', enabled: true, description: 'Featured products section' },
    { id: 'categories', name: 'Categories Section', enabled: true, description: 'Product categories display' },
    { id: 'bestsellers', name: 'Best Sellers', enabled: true, description: 'Best-selling products' },
    { id: 'testimonials', name: 'Testimonials', enabled: true, description: 'Customer reviews and testimonials' },
    { id: 'newsletter', name: 'Newsletter Signup', enabled: true, description: 'Email subscription form' },
    { id: 'announcement', name: 'Announcement Bar', enabled: true, description: 'Top notifications bar' },
  ]);
  
  useEffect(() => {
    // Check if user is logged in and has admin role
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      
      setIsAdmin(true);
      setUserName(userData.name || 'Admin');
      
      // Load saved settings from localStorage or API
      loadSettings();
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  // Load settings from localStorage (in a real app, this would be from your API)
  const loadSettings = () => {
    try {
      const savedNavItems = localStorage.getItem('store_nav_settings');
      const savedComponents = localStorage.getItem('store_component_settings');
      
      if (savedNavItems) {
        setNavItems(JSON.parse(savedNavItems));
      }
      
      if (savedComponents) {
        setStoreComponents(JSON.parse(savedComponents));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  // Toggle navigation item visibility
  const toggleNavItem = (id: string) => {
    setNavItems(items => 
      items.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };
  
  // Toggle store component visibility
  const toggleComponent = (id: string) => {
    setStoreComponents(components => 
      components.map(component => 
        component.id === id ? { ...component, enabled: !component.enabled } : component
      )
    );
  };
  
  // Save settings
  const saveSettings = () => {
    try {
      // Save to localStorage (in a real app, you would save to your database via API)
      localStorage.setItem('store_nav_settings', JSON.stringify(navItems));
      localStorage.setItem('store_component_settings', JSON.stringify(storeComponents));
      
      // Show success message
      setSaveSuccess(true);
      setSaveError('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError('Failed to save settings. Please try again.');
      setSaveSuccess(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800">
          <h2 className="text-xl font-bold text-white">Fraganote Admin</h2>
        </div>
        <nav className="mt-6">
          <Link href="/admin/dashboard" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiBox className="mr-3" /> Dashboard
            </div>
          </Link>
          <Link href="/admin/products" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Products
            </div>
          </Link>
          <Link href="/admin/orders" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Orders
            </div>
          </Link>
          <Link href="/admin/users" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiUsers className="mr-3" /> Users
            </div>
          </Link>
          <Link href="/admin/settings" className="block py-3 px-4 text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 border-l-4 border-blue-600">
            <div className="flex items-center">
              <FiSettings className="mr-3" /> Settings
            </div>
          </Link>
          <Link href="/admin/system" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiSettings className="mr-3" /> System
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full text-left py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900"
          >
            <div className="flex items-center">
              <FiLogOut className="mr-3" /> Logout
            </div>
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-600">Customize your store's appearance and functionality</p>
        </div>
        
        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            Settings saved successfully!
          </div>
        )}
        
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {saveError}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-8">
          {/* Navigation Items Configuration */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Navigation Bar Items</h2>
            <p className="text-gray-500 mb-6">Enable or disable navigation items on your store. When disabled, the page will not be accessible from the navigation.</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Path
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {navItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.path}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.enabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => toggleNavItem(item.id)}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-white ${
                            item.enabled 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {item.enabled ? (
                            <>
                              <FiEyeOff className="mr-1" /> Hide
                            </>
                          ) : (
                            <>
                              <FiEye className="mr-1" /> Show
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Store Components Configuration */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Store Page Components</h2>
            <p className="text-gray-500 mb-6">Enable or disable components that appear on your store pages.</p>
            
            <div className="grid grid-cols-1 gap-4">
              {storeComponents.map((component) => (
                <div key={component.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium">{component.name}</h3>
                    <p className="text-sm text-gray-500">{component.description}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-4 text-sm ${component.enabled ? 'text-green-600' : 'text-red-600'}`}>
                      {component.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button 
                      onClick={() => toggleComponent(component.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        component.enabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          component.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} 
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <FiSave className="mr-2" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
} 