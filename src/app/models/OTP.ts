import mongoose from 'mongoose';

// Define the OTP schema
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // OTP expires after 15 minutes
    expires: 60 * 15,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  }
});

// Create or retrieve the OTP model
const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);

export default OTP; 