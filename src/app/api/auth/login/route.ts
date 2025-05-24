import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/auth-utils';
import { setApiCookies } from '../cookies-util';
import { connectToDatabase } from '@/app/lib/db-connect';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

// Simple in-memory rate limiting
// In production, use a proper rate limiting solution like Redis
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequests = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);
  
  // Clear expired entries occasionally
  if (now % 10 === 0) {
    for (const [key, value] of ipRequests.entries()) {
      if (now > value.resetTime) {
        ipRequests.delete(key);
      }
    }
  }
  
  if (!record) {
    // First request from this IP
    ipRequests.set(ip, { 
      count: 1, 
      resetTime: now + RATE_LIMIT_WINDOW 
    });
    return false;
  }
  
  if (now > record.resetTime) {
    // Reset window has passed
    ipRequests.set(ip, { 
      count: 1, 
      resetTime: now + RATE_LIMIT_WINDOW 
    });
    return false;
  }
  
  // Increment count
  record.count++;
  
  // Check if over limit
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  return false;
}

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
    
    // Connect to MongoDB using centralized utility
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
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
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Generic error for security - don't expose if user exists or not
    if (!user) {
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
    
    // Compare passwords with constant-time comparison
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
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
    
    // Safely get user ID string
    const userId = user._id instanceof Types.ObjectId 
      ? user._id.toString() 
      : typeof user._id === 'string' 
        ? user._id 
        : String(user._id);
    
    // Create JWT token
    const token = await encrypt({ 
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      userId: userId
    });
    
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
          'Expires': '0'
        }
      }
    );
    
    // Set authentication cookies in the response
    setApiCookies(response, user, token);
    
    // Return the response with cookies
    return response;
    
  } catch (error) {
    // Generic error response for security - never expose internal details
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