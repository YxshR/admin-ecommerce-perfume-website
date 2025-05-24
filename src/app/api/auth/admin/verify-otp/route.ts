import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import User, { IUser } from '@/app/models/User';
import OTP from '@/app/models/OTP';
import { encrypt } from '@/app/lib/auth-utils';
import { setApiCookies } from '../../cookies-util';
import { getDocumentId } from '@/app/lib/mongoose-helpers';

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
    secureLog('Admin OTP verification API route called');
    
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
    const { email, otp } = body;
    
    secureLog(`OTP verification attempt for: ${isProduction ? 'redacted' : email}`);
    
    if (!email || !otp) {
      secureLog('Missing email or OTP');
      return NextResponse.json(
        { success: false, error: 'Please provide email and verification code' },
        { status: 400 }
      );
    }
    
    // Normalize the email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find the OTP record
    const otpRecord = await OTP.findOne({ email: normalizedEmail });
    
    if (!otpRecord) {
      secureLog('OTP record not found');
      return NextResponse.json(
        { success: false, error: 'Verification code expired or not found. Please request a new code.' },
        { status: 400 }
      );
    }
    
    // Check if too many attempts
    if (otpRecord.attempts >= 5) {
      secureLog('Too many OTP verification attempts');
      
      // Delete the OTP to force requesting a new one
      await OTP.deleteOne({ email: normalizedEmail });
      
      return NextResponse.json(
        { success: false, error: 'Too many incorrect attempts. Please request a new verification code.' },
        { status: 400 }
      );
    }
    
    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      secureLog('Invalid OTP');
      
      // Increment attempts
      await OTP.updateOne(
        { email: normalizedEmail },
        { $inc: { attempts: 1 } }
      );
      
      return NextResponse.json(
        { success: false, error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }
    
    // Mark OTP as verified
    await OTP.updateOne(
      { email: normalizedEmail },
      { verified: true }
    );
    
    // Get the admin user
    const userDoc = await User.findOne({ 
      email: normalizedEmail,
      role: 'admin'
    });
    
    if (!userDoc) {
      secureLog('Admin user not found');
      return NextResponse.json(
        { success: false, error: 'Admin account not found.' },
        { status: 400 }
      );
    }
    
    // Get user ID safely using helper
    const userId = getDocumentId(userDoc);
    
    // Convert mongoose document to plain object
    const user = userDoc.toObject();
    
    secureLog('OTP verified successfully, generating token');
    
    // Create JWT token
    const token = await encrypt({ 
      email: user.email,
      name: user.name,
      role: user.role,
      userId: userId
    });
    
    // Create a response with cache control headers
    const response = NextResponse.json(
      { 
        success: true,
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
          userId: userId
        }
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block'
        }
      }
    );
    
    // Set authentication cookies in the response
    setApiCookies(response, user, token);
    
    secureLog(`Admin login successful for: ${isProduction ? 'redacted' : normalizedEmail}`);
    
    // Return the response with cookies
    return response;
    
  } catch (error) {
    secureLog('OTP verification error occurred');
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