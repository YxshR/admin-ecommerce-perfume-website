'use client';

import { NextResponse } from 'next/server';
import { TOKEN_EXPIRY } from './auth-utils';
// Import from auth-exports instead of directly re-exporting
import { encrypt, decrypt } from './auth-exports';

// Re-export for compatibility
export { encrypt, decrypt };

// Client-side auth helpers
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check for client-side cookie indicator
    // We'll use a regular cookie (not HTTP-only) just to indicate login status
    // The actual token is stored in an HTTP-only cookie for security
    const loginStatus = document.cookie
      .split('; ')
      .find(row => row.startsWith('isLoggedIn='))
      ?.split('=')[1];
      
    return loginStatus === 'true';
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  
  // First check if the login status indicates we're logged in
  if (!isAuthenticated()) return null;
  
  try {
    // User data is stored in a regular cookie (not sensitive data)
    const userDataCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1];
      
    return userDataCookie ? JSON.parse(decodeURIComponent(userDataCookie)) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const logout = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Remove client-side cookies
    document.cookie = 'isLoggedIn=; Path=/; Max-Age=0; SameSite=Lax';
    document.cookie = 'userData=; Path=/; Max-Age=0; SameSite=Lax';
    
    // Call the logout API to clear HTTP-only cookies
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include' // Important for cookies
    });
    
    // Force refresh to ensure all state is cleared
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Utility for protected routes
export const requireAuth = (router: any) => {
  if (typeof window === 'undefined') return false;
  
  if (!isAuthenticated()) {
    // Save current path for redirect after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/signup') {
      localStorage.setItem('returnUrl', currentPath);
    }
    
    // Redirect to login
    router.push('/login');
    return false;
  }
  
  return true;
};

// Utility for auth pages (login/signup) to redirect away if logged in
export const redirectIfAuthenticated = (router: any) => {
  if (typeof window === 'undefined') return;
  
  if (isAuthenticated()) {
    const returnUrl = localStorage.getItem('returnUrl') || '/store';
    localStorage.removeItem('returnUrl');
    router.push(returnUrl);
  }
};

// Set authentication cookies in the response
export function setAuthCookies(response: NextResponse, user: any, token: string) {
  // Set HTTP-only cookie for the token
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds
    path: '/'
  });
  
  // Set non-HTTP-only cookie for login status check
  response.cookies.set('isLoggedIn', 'true', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY / 1000,
    path: '/'
  });
  
  // Set non-HTTP-only cookie for user data (non-sensitive)
  const userData = {
    userId: user.userId || user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  
  response.cookies.set('userData', JSON.stringify(userData), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY / 1000,
    path: '/'
  });
  
  return response;
}

// Clear authentication cookies in the response
export function clearAuthCookies(response: NextResponse) {
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  });
  
  response.cookies.set('isLoggedIn', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  });
  
  response.cookies.set('userData', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  });
  
  return response;
}