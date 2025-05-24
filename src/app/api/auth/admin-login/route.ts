import { NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/auth';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';
import connectMongoDB from '@/app/lib/mongodb';
import { Types } from 'mongoose';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB using the centralized connection
    await connectMongoDB();
    
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find the user in the database
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if the user is an admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'You do not have admin privileges' },
        { status: 403 }
      );
    }
    
    // Compare passwords
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    } catch (passwordError) {
      return NextResponse.json(
        { success: false, error: 'Authentication error' },
        { status: 500 }
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
    
    // Return the token in the response
    return NextResponse.json({ 
      success: true,
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        userId
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 