import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/auth-utils';
import { setApiCookies } from '../cookies-util';

// Hardcoded admin credentials for bypass - this is a fallback mechanism
// IMPORTANT: In a production environment, consider more secure approaches
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// Rate limiting - basic implementation
const ipRequestCounts: Record<string, { count: number, lastReset: number }> = {};
const MAX_REQUESTS = 5; // Max requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  // Initialize or reset if window has passed
  if (!ipRequestCounts[ip] || (now - ipRequestCounts[ip].lastReset > WINDOW_MS)) {
    ipRequestCounts[ip] = { count: 1, lastReset: now };
    return false;
  }
  
  // Increment count
  ipRequestCounts[ip].count++;
  
  // Check if over limit
  return ipRequestCounts[ip].count > MAX_REQUESTS;
}

// This is a special admin bypass route for development/testing purposes only
// It allows admin login without requiring a MongoDB connection
export async function POST(request: NextRequest) {
  try {
    console.log('Admin bypass login attempt');
    
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    // Check rate limiting
    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide email and password' },
        { status: 400 }
      );
    }
    
    // Check if the provided credentials match the hardcoded admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log('Admin bypass login successful');
      
      // Create admin user object
      const adminUser = {
        _id: 'admin-bypass-id',
        email: ADMIN_EMAIL,
        name: 'Admin User',
        role: 'admin'
      };
      
      // Create JWT token
      const token = await encrypt({ 
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        userId: adminUser._id,
        isEmergencyAccess: true // Flag to indicate this is a bypass login
      });
      
      // Create a response object
      const response = NextResponse.json(
        { 
          success: true,
          user: {
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            userId: adminUser._id
          },
          message: 'Admin bypass login successful'
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      // Set authentication cookies in the response
      setApiCookies(response, adminUser, token);
      
      return response;
    } else {
      console.log('Admin bypass login failed - invalid credentials');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin bypass login error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// Don't cache this route
export const dynamic = 'force-dynamic'; 