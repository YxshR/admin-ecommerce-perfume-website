import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/auth-utils';
import { setApiCookies } from '../cookies-util';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/app/lib/db-connect';
import { Types } from 'mongoose';

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequests = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);
  
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
    
    // Connect to MongoDB using the centralized connection
    await connectToDatabase();
    
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
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
    
    // Find the user in the database
    const user = await User.findOne({ email: email.toLowerCase() });
    
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
    
    // Check if the user is an admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'You do not have admin privileges' },
        { 
          status: 403,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }
    
    // Compare passwords
    try {
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
    } catch (passwordError) {
      return NextResponse.json(
        { success: false, error: 'Authentication error' },
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
    
    // Create JWT token with proper TypeScript typing for the user._id
    const userId = user._id instanceof Types.ObjectId 
      ? user._id.toString() 
      : String(user._id);
      
    const token = await encrypt({ 
      email: user.email,
      name: user.name,
      role: user.role,
      userId
    });
    
    // User data object
    const userData = {
      email: user.email,
      name: user.name,
      role: user.role,
      userId
    };
    
    // Create response with cache control and security headers
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
    
    // Set authentication cookies in the response
    setApiCookies(response, user, token);
    
    return response;
    
  } catch (error) {
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

export const dynamic = 'force-dynamic'; 