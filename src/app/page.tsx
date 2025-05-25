'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, getUser } from './lib/auth';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Set a timeout to ensure we show the demo link for a moment
    const timer = setTimeout(() => {
      // On the client side, check if user is logged in
      if (isAuthenticated()) {
        const user = getUser();
        
        if (user && user.role === 'admin') {
          // If user is admin, redirect to admin dashboard
          router.push('/admin/dashboard');
        } else {
          // For regular users, redirect to store
          router.push('/store-routes');
        }
      } else {
        // For non-logged-in users, redirect to store
        router.push('/store-routes');
      }
    }, 2000); // 2 seconds delay
    
    // Set loading to false after a short delay to show the content
    setTimeout(() => {
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  // Return a loading state while redirecting
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#272420]">
      {loading ? (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      ) : (
        <>
          <p className="text-white text-lg mb-6">Redirecting to store...</p>
          <Link 
            href="/demo" 
            className="px-6 py-2 bg-white text-[#272420] rounded-md hover:bg-gray-200 transition-colors"
          >
            View Cloudinary Demos
          </Link>
        </>
      )}
    </div>
  );
}
