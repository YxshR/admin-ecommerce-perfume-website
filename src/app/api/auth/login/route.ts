import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/auth-utils';
import { setApiCookies } from '../cookies-util';
import { connectToDatabase } from '@/app/lib/db-connect';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('Login API route called');
    
    // Connect to MongoDB using centralized utility
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    const { email, password } = body;
    
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { success: false, error: 'Please provide email and password' },
        { status: 400 }
      );
    }
    
    // Find user in the database
    console.log('Finding user in database...');
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Compare passwords
    console.log('Comparing passwords...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log('Login successful, generating token...');
    // Create JWT token
    const token = await encrypt({ 
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      userId: user._id.toString()
    });
    
    console.log('Token generated, creating response...');
    // Create a response object
    const response = NextResponse.json({ 
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        userId: user._id.toString()
      }
    });
    
    // Set authentication cookies in the response
    console.log('Setting cookies...');
    setApiCookies(response, user, token);
    
    console.log('Login successful for:', email);
    // Return the response with cookies
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// Don't cache this route
export const dynamic = 'force-dynamic'; 