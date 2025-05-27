'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to homepage
    router.push('/');
    
    // Set a flag in localStorage to indicate that the checkout modal should be opened
    localStorage.setItem('open_checkout_modal', 'true');
    
    // Dispatch an event that Nav.tsx can listen for to open the mini cart with checkout
    try {
      const event = new CustomEvent('openMiniCart');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error dispatching openMiniCart event:', error);
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );
} 