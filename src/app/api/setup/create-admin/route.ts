import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';

// Helper function to securely log only in development
const isProduction = process.env.NODE_ENV === 'production';
const secureLog = (message: string) => {
  if (!isProduction) {
    console.log(`[DEV API] ${message}`);
  }
};

export async function GET(request: NextRequest) {
  // This route should only be accessible in development mode
  if (isProduction) {
    return NextResponse.json(
      { success: false, error: 'This route is not available in production' },
      { status: 404 }
    );
  }
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Generate a secure random password (which won't be used with OTP auth)
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(Math.random().toString(36).slice(-10), salt);
    
    // Create or update the admin user
    const result = await User.findOneAndUpdate(
      { email: 'avitoluxury@gmail.com' },
      {
        name: 'Admin',
        email: 'avitoluxury@gmail.com',
        password: password,
        role: 'admin',
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    secureLog('Admin user created/updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Admin user has been created or updated',
      user: {
        id: result._id,
        name: result.name,
        email: result.email,
        role: result.role
      }
    });
    
  } catch (error) {
    secureLog('Error creating admin user');
    console.error('Error details:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}

// Don't cache this route
export const dynamic = 'force-dynamic'; 