import mongoose from 'mongoose';

// Configure Mongoose in development mode
if (process.env.NODE_ENV === 'development') {
  mongoose.set('strictQuery', false);
  mongoose.set('autoIndex', false); // Disable automatic index creation to prevent warnings
}

const MONGODB_URI = process.env.MONGODB_URI as string;

// Validate MongoDB URI format
const isValidMongoDBURI = (uri: string): boolean => {
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
};

// Global interface
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use a global variable to cache the mongoose connection
let globalWithMongoose = global as typeof globalThis & {
  mongoose: MongooseConnection;
};

// Initialize the cached connection
if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using mongoose
 * @returns Promise that resolves to the mongoose instance
 */
export async function connectToDatabase() {
  console.log('Connecting to MongoDB...');
  
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not defined in environment variables');
  }
  
  // Validate the URI format
  if (!isValidMongoDBURI(MONGODB_URI)) {
    throw new Error('Invalid MongoDB URI format');
  }
  
  console.log('MongoDB URI format check: Valid format');
  
  // Check if we're already connected
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return mongoose.connection;
  }
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectToDatabase; 