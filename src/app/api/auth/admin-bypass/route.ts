import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/auth-utils';
import { setApiCookies } from '../cookies-util';

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // Stricter for bypass attempts
const ipRequests = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);
  
  if (!record) {
    ipRequests.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (now > record.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  record.count++;
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

// This is a special admin bypass route for when the database is inaccessible
// It allows admin login without requiring a MongoDB connection
export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { email, password } = body;
    
    // Add a small delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    // Only accept specific hardcoded credentials
    if (email === 'admin@example.com' && password === 'admin123') {
      // Create JWT token
      const token = await encrypt({ 
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        userId: 'admin-bypass-user-id'
      });
      
      // User data object
      const userData = {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        userId: 'admin-bypass-user-id'
      };
      
      // Create a response object with cache control headers
      const response = NextResponse.json(
        { 
          success: true,
          token,
          user: userData
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      // Set authentication cookies
      const mockUser = {
        _id: 'admin-bypass-user-id',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      };
      
      setApiCookies(response, mockUser, token);
      
      return response;
    }
    
    // Return error for invalid credentials - use same error message to avoid user enumeration
    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { 
        status: 401,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    // Generic error response for security
    return NextResponse.json(
      { success: false, error: 'Authentication failed. Please try again.' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}

// Don't cache this route
export const dynamic = 'force-dynamic'; 