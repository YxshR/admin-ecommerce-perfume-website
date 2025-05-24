import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Note: In Next.js middleware, we can't access localStorage because it runs on the edge
  // All authentication checks are now handled on the client side
  
  return NextResponse.next();
}

// Only run middleware on specific paths (keeping this minimal for now)
export const config = {
  matcher: [
    // Only check admin routes in middleware
    '/dashboard/:path*',
    '/admin/:path*'
  ],
}; 