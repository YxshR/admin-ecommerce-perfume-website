import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, isAdminEmail } from '@/app/lib/email-utils';
import { encrypt } from '@/app/lib/auth-utils';
import { setApiCookies } from '../cookies-util';
import { connectToDatabase } from '@/app/lib/db-connect';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';

// Rate limiting implementation
const ipRequestCounts: Record<string, { count: number, lastReset: number }> = {};
const MAX_REQUESTS = 5; // Max requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  // Initialize or reset if window has passed
  if (!ipRequestCounts[ip] || (now - ipRequestCounts[ip].lastReset > WINDOW_MS)) {
    ipRequestCounts[ip] = { count: 1, lastReset: now };
    return false;
  }
  
  // Increment count
  ipRequestCounts[ip].count++;
  
  // Check if over limit
  return ipRequestCounts[ip].count > MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    // Check rate limiting
    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { email, otp } = body;
    
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Please provide email and verification code' },
        { status: 400 }
      );
    }
    
    // Verify email is in admin whitelist
    if (!isAdminEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access attempt' },
        { status: 401 }
      );
    }
    
    // Verify OTP
    const isValidOTP = verifyOTP(email, otp);
    
    if (!isValidOTP) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code' },
        { status: 401 }
      );
    }
    
    // OTP is valid, now try to get or create admin user in database
    let adminUser;
    
    try {
      await connectToDatabase();
      
      // Check if admin user exists
      adminUser = await User.findOne({ 
        email: email.toLowerCase(),
        role: 'admin'
      });
      
      // If admin doesn't exist in database but is in whitelist, create them
      if (!adminUser) {
        console.log(`Creating new admin user for ${email}`);
        
        // Generate a secure random password (they'll login via OTP)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(
          Math.random().toString(36).slice(-10), 
          salt
        );
        
        // Create new admin user
        const newAdmin = new User({
          email: email.toLowerCase(),
          password: hashedPassword, // Random password
          name: email.split('@')[0], // Use part of email as name
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Save to database
        adminUser = await newAdmin.save();
      }
      
    } catch (dbError) {
      console.error('Database error during admin OTP verification:', dbError);
      
      // If database fails, create a temporary admin user object
      adminUser = {
        _id: 'temp-admin-id',
        email: email.toLowerCase(),
        name: email.split('@')[0],
        role: 'admin'
      };
    }
    
    // Create JWT token
    const token = await encrypt({ 
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      userId: adminUser._id.toString()
    });
    
    // Create a response object
    const response = NextResponse.json(
      { 
        success: true,
        user: {
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          userId: adminUser._id.toString()
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
    setApiCookies(response, adminUser, token);
    
    return response;
    
  } catch (error) {
    console.error('Admin OTP verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Don't cache this route
export const dynamic = 'force-dynamic'; 