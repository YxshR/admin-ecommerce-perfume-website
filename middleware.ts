import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './src/app/lib/auth-utils';

// Protected paths that require authentication
const protectedPaths = [
  '/account',
  '/account/wishlist',
  '/account/orders'
];

// Admin-only paths
const adminPaths = [
  '/admin/dashboard',
  '/admin/products',
  '/admin/orders',
  '/admin/users',
  '/admin/contacts',
  '/admin/settings',
  '/admin/system'
];

// Paths that should always be accessible
const publicPaths = [
  '/admin/login',
  '/login',
  '/register'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and certain API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('favicon') ||
    pathname.includes('.') ||
    publicPaths.some(path => pathname === path)
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Get session from cookies for protected routes
  if (
    adminPaths.some(path => pathname.startsWith(path)) || 
    protectedPaths.some(path => pathname.startsWith(path))
  ) {
    const session = await getSessionFromRequest(request);

    // Check if the path is admin-only
    const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

    // Check if the path is protected
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    // If path is admin-only and user is not an admin, redirect to admin login
    if (isAdminPath && (!session || session.role !== 'admin')) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/admin/login', request.url)));
    }

    // If path is protected and user is not authenticated, redirect to login
    if (isProtectedPath && !session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // For all other routes, just apply security headers
  return applySecurityHeaders(NextResponse.next());
}

// Helper function to get session from request
async function getSessionFromRequest(request: NextRequest) {
  try {
    // First try to get token from cookie - check both admin_token and regular token
    const adminToken = request.cookies.get('admin_token')?.value;
    const regularToken = request.cookies.get('token')?.value;
    const token = adminToken || regularToken;
    
    // If no token in cookie, check authorization header
    const authToken = token || request.headers.get('authorization')?.split(' ')[1] || null;
    
    // If no token found, return null
    if (!authToken) {
      return null;
    }
    
    // Decrypt and verify the token
    const payload = await decrypt(authToken);
    if (!payload) {
      return null;
    }
    
    // Return user info from payload
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  } catch (error) {
    console.error('Error in getSessionFromRequest:', error);
    return null;
  }
}

// Helper function to apply security headers to any response
function applySecurityHeaders(response: NextResponse) {
  // Add security headers
  const securityHeaders = {
    // Content Security Policy to prevent XSS attacks
    'Content-Security-Policy':
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://placehold.co https://storage.googleapis.com https://*.google-analytics.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://storage.googleapis.com https://*.google-analytics.com http://localhost:* https://localhost:* https://*.mongodb.net; " +
      "frame-src 'self'; " +
      "object-src 'none'; " +
      "base-uri 'self';",
    
    // Prevent clickjacking attacks
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS protection in older browsers
    'X-XSS-Protection': '1; mode=block',
    
    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Enforce HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Permissions policy to limit features
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  };

  // Apply all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except API routes and static files
    '/((?!api|_next/static|_next/image|_next/webpack|favicon.ico).*)',
  ],
}; 