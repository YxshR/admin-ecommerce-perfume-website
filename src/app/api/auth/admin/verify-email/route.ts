import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import User from '@/app/models/User';
import OTP from '@/app/models/OTP';
import { generateOTP, sendOTPEmail } from '@/app/lib/email-service';

// Helper function to securely log only in development
const isProduction = process.env.NODE_ENV === 'production';
const secureLog = (message: string) => {
  if (!isProduction) {
    console.log(`[DEV API] ${message}`);
  }
};

// Rate limiting
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
    secureLog('Admin email verification API route called');
    
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    // Check rate limiting
    if (checkRateLimit(ip)) {
      secureLog(`Rate limit exceeded for IP: ${isProduction ? 'redacted' : ip}`);
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Retry-After': '60'
          }
        }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    const { email } = body;
    
    secureLog(`Email verification attempt for: ${isProduction ? 'redacted' : email}`);
    
    if (!email) {
      secureLog('Missing email');
      return NextResponse.json(
        { success: false, error: 'Please provide an email address' },
        { status: 400 }
      );
    }
    
    // Normalize the email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if the provided email is an admin email
    const user = await User.findOne({ 
      email: normalizedEmail,
      role: 'admin'
    });
    
    if (!user) {
      secureLog('Admin not found for the provided email');
      
      // Return a generic message to prevent email enumeration
      return NextResponse.json(
        { success: false, error: 'If this email is registered as an admin, an OTP will be sent.' },
        { status: 200 }
      );
    }
    
    // Generate a new OTP
    const otp = generateOTP();
    
    // Save the OTP to the database
    await OTP.findOneAndUpdate(
      { email: normalizedEmail },
      { 
        email: normalizedEmail,
        otp: otp,
        attempts: 0,
        verified: false,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    // Send the OTP via email
    const emailSent = await sendOTPEmail(normalizedEmail, otp);
    
    if (!emailSent) {
      secureLog('Failed to send OTP email');
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }
    
    secureLog('OTP sent successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    });
    
  } catch (error) {
    secureLog('Email verification error occurred');
    if (!isProduction) {
      console.error('Error details:', error);
    }
    
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// Don't cache this route
export const dynamic = 'force-dynamic'; 