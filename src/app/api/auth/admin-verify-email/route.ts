import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, isAdminEmail, saveOTP, sendOTPEmail } from '@/app/lib/email-utils';
import { connectToDatabase } from '@/app/lib/db-connect';
import User from '@/app/models/User';

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
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Please provide an email address' },
        { status: 400 }
      );
    }
    
    // Check if email is in admin whitelist
    if (!isAdminEmail(email)) {
      // Don't reveal that the email is not in the whitelist for security
      return NextResponse.json(
        { success: false, error: 'Email verification failed' },
        { status: 401 }
      );
    }
    
    try {
      // Connect to MongoDB to check if email exists
      await connectToDatabase();
      
      // Check if email exists in the database as admin
      const adminUser = await User.findOne({ 
        email: email.toLowerCase(),
        role: 'admin'
      });
      
      // If admin user doesn't exist in DB, create it
      if (!adminUser) {
        console.log(`Admin user with email ${email} not found in database, creating...`);
        // This is a whitelisted admin email but not in DB yet
        // We'll add it to the DB later during first successful login
      }
      
      // Generate OTP
      const otp = generateOTP();
      
      // Save OTP
      saveOTP(email, otp);
      
      // Send OTP email
      const emailSent = await sendOTPEmail(email, otp);
      
      if (!emailSent) {
        throw new Error('Failed to send OTP email');
      }
      
      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email',
        emailSent: true
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // If DB connection fails, still allow login for whitelisted emails
      // Generate OTP
      const otp = generateOTP();
      
      // Save OTP
      saveOTP(email, otp);
      
      // Send OTP email
      const emailSent = await sendOTPEmail(email, otp);
      
      if (!emailSent) {
        throw new Error('Failed to send OTP email');
      }
      
      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email',
        emailSent: true
      });
    }
    
  } catch (error) {
    console.error('Admin email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Don't cache this route
export const dynamic = 'force-dynamic'; 