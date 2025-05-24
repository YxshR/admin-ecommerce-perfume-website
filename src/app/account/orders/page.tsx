'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../../lib/auth';

export default function OrdersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      localStorage.setItem('returnUrl', '/store/orders');
      router.push('/login');
      return;
    }

    // Redirect to the correct orders page
    router.push('/store/orders');
  }, [router]);

  // Return a loading state while redirecting
  return (
    <div className="bg-[#272420] text-white min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto pt-10 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
        </div>
        <p className="text-center mt-4 text-gray-400">Redirecting to orders page...</p>
      </div>
    </div>
  );
} 