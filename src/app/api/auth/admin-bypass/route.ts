import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/auth-utils';
import { setAuthCookies } from '@/app/lib/auth';
import connectMongoDB from '@/app/lib/mongodb';

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
      
      // Try connecting to MongoDB in the background, but don't require it
      try {
        console.log('Attempting MongoDB connection during admin bypass...');
        const db = await connectMongoDB();
        console.log('MongoDB connection successful during admin bypass');
      } catch (mongoError) {
        console.error('MongoDB connection failed during admin bypass:', mongoError);
        // Continue with bypass login even if MongoDB connection fails
      }
      
      // Create user data object
      const userData = {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        userId: 'admin-bypass-user-id'
      };
      
      // Create JWT token
      const token = await encrypt(userData);
      
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
      
      // Set authentication cookies using the standard function
      setAuthCookies(response, userData, token);
      
      console.log('Admin bypass login successful, returning response');
      return response;
    }
    
    // Return error for invalid credentials
    console.log('Admin bypass login failed: Invalid credentials');
    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );
    
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