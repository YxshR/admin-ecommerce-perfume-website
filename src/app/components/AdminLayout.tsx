'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiLogOut, FiSettings, FiMail } from 'react-icons/fi';
import { useAdminAuth, adminLogout } from '@/app/lib/admin-auth';

interface AdminLayoutProps {
  children: ReactNode;
  activeRoute?: string;
}

// Add this debug function
function checkAdminAuthState() {
  console.log('Checking admin auth state...');
  
  // Check localStorage tokens
  const adminToken = localStorage.getItem('admin_token');
  const regularToken = localStorage.getItem('token');
  
  // Check cookies
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };
  
  const adminCookie = getCookie('admin_token');
  const regularCookie = getCookie('token');
  
  console.log({
    adminToken: adminToken ? 'Present' : 'Missing',
    regularToken: regularToken ? 'Present' : 'Missing',
    adminCookie: adminCookie ? 'Present' : 'Missing',
    regularCookie: regularCookie ? 'Present' : 'Missing'
  });
}

export default function AdminLayout({ children, activeRoute = '/admin/dashboard' }: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAdminAuth();
  
  useEffect(() => {
    checkAdminAuthState();
  }, []);
  
  const handleLogout = () => {
    adminLogout(router);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // useAdminAuth hook will automatically redirect if not authenticated
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800">
          <h2 className="text-xl font-bold text-white">Fraganote Admin</h2>
        </div>
        <nav className="mt-6">
          <Link 
            href="/admin/dashboard" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/dashboard' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center">
              <FiBox className="mr-3" /> Dashboard
            </div>
          </Link>
          <Link 
            href="/admin/products" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/products' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Products
            </div>
          </Link>
          <Link 
            href="/admin/orders" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/orders' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Orders
            </div>
          </Link>
          <Link 
            href="/admin/users" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/users' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center">
              <FiUsers className="mr-3" /> Users
            </div>
          </Link>
          <Link 
            href="/admin/contacts" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/contacts' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center">
              <FiMail className="mr-3" /> Contacts
            </div>
          </Link>
          <Link 
            href="/admin/settings" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/settings' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center">
              <FiSettings className="mr-3" /> Settings
            </div>
          </Link>
          <Link 
            href="/admin/system" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/system' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
          >
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
        {/* Header with user info */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.name || 'Admin'}</h1>
          <p className="text-gray-600 text-sm">Logged in as {user?.email || 'admin'}</p>
        </div>
        
        {/* Page content */}
        {children}
      </div>
    </div>
  );
} 