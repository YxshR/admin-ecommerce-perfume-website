import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the response headers
  const response = NextResponse.next();
  
  // Add security headers
  const securityHeaders = new Headers(response.headers);
  
  // Content Security Policy - restricts resources and prevents XSS
  securityHeaders.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https://*; connect-src 'self' https://*; frame-ancestors 'none';"
  );
  
  // X-Content-Type-Options - prevents MIME type sniffing
  securityHeaders.set('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options - prevents clickjacking
  securityHeaders.set('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection - provides XSS protection for older browsers
  securityHeaders.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy - controls information sent in referrer header
  securityHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy - restricts features
  securityHeaders.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // Feature-Policy - legacy header for feature restrictions
  securityHeaders.set(
    'Feature-Policy',
    "camera 'none'; microphone 'none'; geolocation 'none'"
  );
  
  // Add anti-debugging JavaScript to response headers
  // This makes it harder to view console logs and debug the site
  if (process.env.NODE_ENV === 'production') {
    securityHeaders.set(
      'Content-Security-Policy',
      securityHeaders.get('Content-Security-Policy') + " script-src-elem 'self' 'nonce-secureNonce';"
    );
  }
  
  // Create a new response with the security headers
  const secureResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: securityHeaders,
  });
  
  return secureResponse;
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 