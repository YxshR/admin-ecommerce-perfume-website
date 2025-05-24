import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/auth-utils';
import { setApiCookies } from '../cookies-util';
import { connectToDatabase } from '@/app/lib/db-connect';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

// Helper function to securely log only in development
const isProduction = process.env.NODE_ENV === 'production';
const secureLog = (message: string) => {
  if (!isProduction) {
    console.log(`[DEV API] ${message}`);
  }
};

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

export async function POST(request: NextRequest) {
  try {
    secureLog('Login API route called');
    
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    // Check rate limiting
    if (checkRateLimit(ip)) {
      secureLog(`Rate limit exceeded for IP: ${isProduction ? 'redacted' : ip}`);
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Retry-After': '60'
          }
        }
      );
    }
    
    // Connect to MongoDB using centralized utility
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    const { email, password } = body;
    
    secureLog(`Login attempt received ${isProduction ? '' : 'for: ' + email}`);
    
    if (!email || !password) {
      secureLog('Missing email or password');
      return NextResponse.json(
        { success: false, error: 'Please provide email and password' },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }
    
    // Find user in the database
    secureLog('Finding user in database');
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      secureLog('User not found');
      
      // Use constant-time response to prevent timing attacks
      // Always perform a bcrypt compare even if user doesn't exist
      await bcrypt.compare(password, '$2a$10$fakehashfornonexistentuser00000000000000000000000');
      
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
    }
    
    // Compare passwords
    secureLog('Comparing passwords');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      secureLog('Invalid password');
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
    }
    
    secureLog('Login successful, generating token');
    
    // Safely handle the user._id (could be ObjectId or string)
    const userId = user._id instanceof Types.ObjectId 
      ? user._id.toString() 
      : String(user._id);
      
    // Create JWT token
    const token = await encrypt({ 
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      userId: userId
    });
    
    secureLog('Token generated, creating response');
    // Create a response object with cache control headers
    const response = NextResponse.json(
      { 
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role || 'user',
          userId: userId
        }
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block'
      }
      }
    );
    
    // Set authentication cookies in the response
    secureLog('Setting cookies');
    setApiCookies(response, user, token);
    
    secureLog(`Login successful ${isProduction ? '' : 'for: ' + email}`);
    // Return the response with cookies
    return response;
    
  } catch (error) {
    secureLog('Login error occurred');
    if (!isProduction) {
      console.error('Login error details:', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
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