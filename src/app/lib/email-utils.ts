import nodemailer from 'nodemailer';

// Create a transporter object using SMTP transport
const createTransporter = () => {
  // For production, use actual SMTP credentials
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'avitoluxury@gmail.com',
      pass: process.env.EMAIL_PASSWORD // This should be set in your .env file
    }
  });
};

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to admin email
export const sendAdminOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    // Check if email configuration is available
    if (!process.env.EMAIL_PASSWORD) {
      console.error('Email password not configured. Please set EMAIL_PASSWORD in .env.local');
      return false;
    }
    
    // Email content
    const mailOptions = {
      from: `"Avito Luxury Admin" <${process.env.EMAIL_USER || 'avitoluxury@gmail.com'}>`,
      to: email,
      subject: 'Admin Login OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1a202c; color: white; padding: 20px; text-align: center;">
            <h1>Avito Luxury Admin Portal</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
            <p>Hello Admin,</p>
            <p>Your one-time password (OTP) for admin login is:</p>
            <div style="background-color: #f7fafc; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This OTP is valid for 10 minutes. Please do not share this with anyone.</p>
            <p>If you did not request this OTP, please ignore this email and ensure your account is secure.</p>
            <p>Thank you,<br>Avito Luxury Team</p>
          </div>
          <div style="background-color: #f7fafc; padding: 10px; text-align: center; font-size: 12px; color: #718096;">
            &copy; ${new Date().getFullYear()} Avito Luxury. All rights reserved.
          </div>
        </div>
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}; 