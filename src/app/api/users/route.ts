import { NextResponse } from 'next/server';
import User, { IUser } from '../../models/User';
import { connectToDatabase } from '@/app/lib/db-connect';
import { getDocumentId } from '@/app/lib/mongoose-helpers';

// Helper function to securely log only in development
const isProduction = process.env.NODE_ENV === 'production';
const secureLog = (message: string) => {
  if (!isProduction) {
    console.log(`[DEV API] ${message}`);
  }
};

// GET all users
export async function GET(request: Request) {
  try {
    secureLog('Fetching users from database');
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Fetch real users from the database
    const users = await User.find({})
      .select('name email role createdAt lastLogin status')
      .sort({ createdAt: -1 });
    
    // Format users for the API response
    const formattedUsers = users.map((userDoc) => {
      const user = userDoc.toObject();
      return {
        id: getDocumentId(userDoc),
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        lastLogin: user.lastLogin?.toISOString() || null,
        status: user.status || 'active'
      };
    });
    
    secureLog(`Found ${formattedUsers.length} users`);
    
    return NextResponse.json({ 
      success: true, 
      users: formattedUsers,
      total: formattedUsers.length
    });
    
  } catch (error) {
    secureLog('Error fetching users');
    if (!isProduction) {
      console.error('Error details:', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST a new user
export async function POST(request: Request) {
  try {
    secureLog('Creating new user');
    
    // Connect to MongoDB
    await connectToDatabase();
    
    const body = await request.json();
    
    // Check if user already exists
    const userExists = await User.findOne({ email: body.email });
    if (userExists) {
      secureLog('User already exists');
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Create the user
    const userDoc = await User.create({
      ...body,
      createdAt: new Date(),
      status: 'active'
    });
    
    secureLog('User created successfully');
    
    return NextResponse.json({
      success: true,
      user: {
        id: getDocumentId(userDoc),
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role || 'user',
        createdAt: userDoc.createdAt?.toISOString(),
        status: userDoc.status || 'active'
      }
    }, { status: 201 });
    
  } catch (err) {
    secureLog('Error creating user');
    if (!isProduction) {
      console.error('Error details:', err);
    }
    
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// Enable dynamic API route
export const dynamic = 'force-dynamic'; 