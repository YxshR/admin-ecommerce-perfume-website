'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from './lib/auth';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // On the client side, check if user is logged in
    if (isAuthenticated()) {
      const user = getUser();
      
      if (user && user.role === 'admin') {
        // If user is admin, redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        // For regular users, redirect to store
        router.push('/store');
      }
    } else {
      // For non-logged-in users, redirect to store
      router.push('/store');
    }
  }, [router]);
  
  // Return a loading state while redirecting
  return (
    <div className="flex items-center justify-center h-screen bg-[#272420]">
      <p className="text-white text-lg">Redirecting...</p>
    </div>
  );
}
