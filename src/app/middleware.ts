import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/auth-utils';

// Protected paths that require authentication
const protectedPaths = [
  '/account',
  '/account/wishlist',
  '/account/orders',
  '/admin',
];

// Admin-only paths
const adminPaths = [
  '/admin',
];

export async function middleware(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // Check if the path is admin-only
  const isAdminPath = adminPaths.some(path => 
    pathname.startsWith(path)
  );

  // If path is protected and user is not authenticated, redirect to login
  if (isProtectedPath && !session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // If path is admin-only and user is not an admin, redirect to home
  if (isAdminPath && (!session || session.role !== 'admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Helper function to get session from request
async function getSessionFromRequest(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('token')?.value;
    
    // If no token found, return null
    if (!token) {
      return null;
    }
    
    // Decrypt and verify the token
    const payload = await decrypt(token);
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

// Configure the middleware to run on specific paths
export const config = {
  // Match all request paths except for static files, api routes, and _next
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 