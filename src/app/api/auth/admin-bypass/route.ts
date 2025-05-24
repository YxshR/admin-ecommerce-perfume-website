import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/auth-utils';
import { setApiCookies } from '../cookies-util';

// This is a special admin bypass route for development/testing purposes only
// It allows admin login without requiring a MongoDB connection
export async function POST(request: NextRequest) {
  try {
    console.log('Admin bypass login route called');
    
    // Get request body
    const body = await request.json();
    const { email, password } = body;
    
    console.log('Admin bypass attempt for:', email);
    
    // Only accept specific hardcoded credentials
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Admin bypass successful');
      
      // Create JWT token
      const token = await encrypt({ 
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        userId: 'admin-bypass-user-id'
      });
      
      // Create a response object with cache control headers
      const response = NextResponse.json(
        { 
          success: true,
          token,
          user: {
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            userId: 'admin-bypass-user-id'
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
      
      // Set authentication cookies
      const mockUser = {
        _id: 'admin-bypass-user-id',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      };
      
      setApiCookies(response, mockUser, token);
      
      console.log('Admin bypass login successful, returning response');
      return response;
    }
    
    // Return error for invalid credentials
    console.log('Admin bypass login failed: Invalid credentials');
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
    console.error('Admin bypass login error:', error);
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