import nodemailer from 'nodemailer';

// OTP configuration
const OTP_EXPIRY_MINUTES = 10;
const ADMIN_EMAILS = ['youngblood.yr@gmail.com', 'avitoluxury@gmail.com'];

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'avitoluxury@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password-here' // Use app password for Gmail
  }
});

/**
 * Generate a random OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if email is an admin email
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Send OTP email to admin
 */
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'avitoluxury@gmail.com',
      to: email,
      subject: 'AVITO Admin Login - One-Time Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #333;">AVITO Admin Portal</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
            <h2 style="color: #333; margin-top: 0;">Your One-Time Password</h2>
            <p style="margin-bottom: 20px;">You requested to log in to the AVITO admin panel. Use the following OTP code to complete your login:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; padding: 10px 20px; background-color: #eee; border-radius: 5px;">${otp}</span>
            </div>
            <p style="margin-bottom: 5px;">This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
            <p style="color: #777; font-size: 12px; margin-top: 30px;">If you did not request this code, please ignore this email. Someone may have typed your email address by mistake.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} AVITO Luxury. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

/**
 * Store and manage OTP codes with expiry times
 */
interface OTPRecord {
  otp: string;
  expiresAt: Date;
}

const otpStore: Map<string, OTPRecord> = new Map();

/**
 * Save an OTP for a specific email
 */
export function saveOTP(email: string, otp: string): void {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);
  
  otpStore.set(email.toLowerCase(), { otp, expiresAt });
}

/**
 * Verify OTP for a specific email
 */
export function verifyOTP(email: string, otp: string): boolean {
  const record = otpStore.get(email.toLowerCase());
  
  if (!record) {
    return false;
  }
  
  // Check if OTP is expired
  if (new Date() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return false;
  }
  
  // Check if OTP matches
  const isValid = record.otp === otp;
  
  // Delete OTP after successful verification
  if (isValid) {
    otpStore.delete(email.toLowerCase());
  }
  
  return isValid;
} 