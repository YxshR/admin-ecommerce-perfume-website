import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';

// Admin credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin User';

export async function GET(request: NextRequest) {
  try {
    // Check for secret key to prevent unauthorized access
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get('key');
    
    // Require a secret key for security (you should change this to something more secure)
    if (secretKey !== 'setup-admin-securely') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Starting admin user setup...');
    
    // Connect to MongoDB
    await connectToDatabase();
    console.log('Connected to database');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        credentials: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        }
      });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    
    // Create admin user
    const newAdmin = new User({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Save admin user to database
    await newAdmin.save();
    console.log('Admin user created successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create admin user',
      details: process.env.NODE_ENV === 'development' ? error : null
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 