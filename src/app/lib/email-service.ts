import nodemailer from 'nodemailer';

// Production check
const isProduction = process.env.NODE_ENV === 'production';

// Secure logging
const secureLog = (message: string, data?: any) => {
  if (!isProduction) {
    if (data) {
      console.log(`[DEV EMAIL] ${message}`, data);
    } else {
      console.log(`[DEV EMAIL] ${message}`);
    }
  }
};

// For development, use a test account
// For production, use a real email service
const getTransporter = async () => {
  if (!isProduction) {
    // Create a test account using Ethereal (for development only)
    const testAccount = await nodemailer.createTestAccount();
    secureLog('Created test email account', { 
      user: testAccount.user, 
      pass: testAccount.pass 
    });

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    // Use a real email service in production
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'avitoluxury@gmail.com',
        pass: process.env.EMAIL_PASSWORD,  // Use app password for Gmail
      },
    });
  }
};

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    const transporter = await getTransporter();
    
    const mailOptions = {
      from: isProduction 
        ? process.env.EMAIL_USER || 'avitoluxury@gmail.com'
        : 'admin@test.com',
      to: email,
      subject: 'Admin Login OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #333;">Avito Luxury Admin Access</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 4px;">
            <p style="margin-bottom: 15px; font-size: 16px;">Hello Admin,</p>
            <p style="margin-bottom: 15px; font-size: 16px;">Your one-time password (OTP) for admin login is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; padding: 15px 30px; background-color: #f0f0f0; border-radius: 4px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                ${otp}
              </div>
            </div>
            <p style="margin-bottom: 15px; font-size: 16px;">This OTP is valid for 15 minutes. Do not share this OTP with anyone.</p>
            <p style="font-size: 14px; color: #777; margin-top: 30px;">If you did not request this OTP, please ignore this email and ensure your account is secure.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 14px; color: #888;">Avito Luxury Perfumes</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (!isProduction) {
      // Log the Ethereal URL to view the email in development
      secureLog(`Email sent: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      secureLog(`Email sent to: ${email}`);
    }
    
    return true;
  } catch (error) {
    secureLog('Error sending email', error);
    return false;
  }
}; 