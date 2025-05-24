import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/auth-utils';
import { setApiCookies } from '../cookies-util';
import { connectToDatabase } from '@/app/lib/db-connect';
import User, { IUser } from '@/app/models/User';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    console.log('Signup API route called');
    
    // Connect to MongoDB
    try {
      console.log('Connecting to database...');
      await connectToDatabase();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { success: false, error: 'Unable to connect to database. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Get request data
    let body;
    try {
      body = await request.json();
      console.log('Received signup request payload');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { name, email, password } = body;
    console.log('Signup request for:', email);
    
    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Please provide all required information' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    console.log('Checking if user already exists');
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email.toLowerCase() });
      console.log('User exists check result:', existingUser ? 'User exists' : 'User does not exist');
    } catch (userCheckError) {
      console.error('Error checking for existing user:', userCheckError);
      return NextResponse.json(
        { success: false, error: 'Database error checking user. Please try again.' },
        { status: 500 }
      );
    }
    
    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 } // Conflict
      );
    }
    
    // Hash password
    console.log('Hashing password');
    let hashedPassword;
    try {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      return NextResponse.json(
        { success: false, error: 'Server error processing your request' },
        { status: 500 }
      );
    }
    
    // Create new user
    console.log('Creating new user');
    let newUser;
    try {
      newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user'
      });
      
      // Safe way to handle the user document
      const userId = newUser._id instanceof mongoose.Types.ObjectId 
        ? newUser._id.toString()
        : String(newUser._id);
      
      console.log('User created successfully with ID:', userId);
      
      // Create JWT token
      console.log('Generating token');
      const token = await encrypt({
        userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      });
      console.log('Token generated successfully');
      
      // Create response with user data
      console.log('Creating response');
      const response = NextResponse.json({
        success: true,
        user: {
          userId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
      
      // Set cookies
      console.log('Setting cookies');
      setApiCookies(response, {
        userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }, token);
      
      console.log('Signup successful for:', email);
      return response;
      
    } catch (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user account. Please try again.' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// Don't cache this route
export const dynamic = 'force-dynamic'; 