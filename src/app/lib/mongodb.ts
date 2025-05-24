import mongoose from 'mongoose';

// Use environment variable only - don't include fallback connection string with credentials
const MONGODB_URI = process.env.MONGODB_URI;

// Connection state tracking
let isConnected = false;

/**
 * Connect to MongoDB using mongoose
 * @returns Mongoose connection instance
 */
async function connectMongoDB() {
  // If already connected, return the existing connection
  if (isConnected) {
    return mongoose;
  }

  try {
    // Check if mongoose already has an active connection
    if (mongoose.connections[0].readyState) {
      isConnected = true;
      return mongoose;
    }

    // Verify MongoDB URI is available
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not defined in environment variables');
    }

    // Otherwise establish a new connection
    const db = await mongoose.connect(MONGODB_URI);
    
    isConnected = true;
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Add more detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if ('code' in error) console.error('Error code:', (error as any).code);
    }
    throw error;
  }
}

export default connectMongoDB; 