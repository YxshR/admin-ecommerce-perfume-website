import twilio from 'twilio';

// Create a Twilio client instance
const createTwilioClient = () => {
  // Get Twilio credentials from environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID ;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!authToken) {
    console.error('Twilio auth token not configured. Please set TWILIO_AUTH_TOKEN in .env.local');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format phone number to E.164 format for Twilio
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Add country code if needed (assuming India +91 prefix)
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // If already has country code
  if (digits.length > 10) {
    return `+${digits}`;
  }
  
  // Return as is if format is unclear
  return phoneNumber;
};

// Send OTP to admin phone via Twilio Verify
export const sendAdminSMS = async (phoneNumber: string): Promise<boolean> => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.error('Failed to create Twilio client');
      return false;
    }
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID ;
    
    // Start the verification process using Twilio Verify
    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({
        to: formattedPhone,
        channel: 'sms'
      });
    
    console.log('Verification initiated with SID:', verification.sid);
    return true;
  } catch (error) {
    console.error('Error sending verification SMS:', error);
    return false;
  }
};

// Verify OTP code using Twilio Verify
export const verifyAdminSMS = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.error('Failed to create Twilio client');
      return false;
    }
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID ;
    
    // Check the verification code
    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({
        to: formattedPhone,
        code: otp
      });
    
    console.log('Verification check status:', verificationCheck.status);
    return verificationCheck.status === 'approved';
  } catch (error) {
    console.error('Error verifying SMS code:', error);
    return false;
  }
}; 