import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../models/User';

// Connect to MongoDB
const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb+srv://Yash:8BQEkh4JaATCGblO@yash.pweao0h.mongodb.net/ecommerce");
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
  }
};

// GET all users
export async function GET(request: Request) {
  try {
    // In a real application, you would fetch users from your database
    // For now, we'll create mock data
    const mockUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@Administrator.com',
        role: 'admin',
        createdAt: '2023-05-01T10:00:00Z',
        lastLogin: '2023-06-15T08:30:00Z',
        status: 'active'
      },
      {
        id: '2',
        name: 'John Smith',
        email: 'john@example.com',
        role: 'user',
        createdAt: '2023-05-10T14:25:00Z',
        lastLogin: '2023-06-14T16:45:00Z',
        status: 'active'
      },
      {
        id: '3',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        role: 'user',
        createdAt: '2023-05-12T09:15:00Z',
        lastLogin: '2023-06-13T11:20:00Z',
        status: 'active'
      },
      {
        id: '4',
        name: 'Rahul Kumar',
        email: 'rahul@example.com',
        role: 'user',
        createdAt: '2023-05-15T16:30:00Z',
        lastLogin: '2023-06-10T14:10:00Z',
        status: 'active'
      },
      {
        id: '5',
        name: 'Amit Patel',
        email: 'amit@example.com',
        role: 'user',
        createdAt: '2023-05-18T11:45:00Z',
        lastLogin: '2023-06-09T10:05:00Z',
        status: 'inactive'
      },
      {
        id: '6',
        name: 'Sneha Gupta',
        email: 'sneha@example.com',
        role: 'user',
        createdAt: '2023-05-20T13:20:00Z',
        lastLogin: '2023-06-08T09:30:00Z',
        status: 'active'
      },
      {
        id: '7',
        name: 'Vijay Reddy',
        email: 'vijay@example.com',
        role: 'user',
        createdAt: '2023-05-22T10:10:00Z',
        lastLogin: '2023-06-07T17:15:00Z',
        status: 'active'
      },
      {
        id: '8',
        name: 'Meera Joshi',
        email: 'meera@example.com',
        role: 'user',
        createdAt: '2023-05-25T15:40:00Z',
        lastLogin: null,
        status: 'inactive'
      },
      {
        id: '9',
        name: 'Arjun Singh',
        email: 'arjun@example.com',
        role: 'user',
        createdAt: '2023-05-28T12:30:00Z',
        lastLogin: '2023-06-05T11:25:00Z',
        status: 'active'
      },
      {
        id: '10',
        name: 'Kavita Verma',
        email: 'kavita@example.com',
        role: 'user',
        createdAt: '2023-05-30T09:50:00Z',
        lastLogin: '2023-06-04T14:40:00Z',
        status: 'active'
      }
    ];

    // Return the mock data
    return NextResponse.json({ 
      success: true, 
      users: mockUsers,
      total: mockUsers.length
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST a new user
export async function POST(request: Request) {
  try {
    await connectMongo();
    const body = await request.json();
    
    // Check if user already exists
    const userExists = await User.findOne({ email: body.email });
    if (userExists) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
    }
    
    const user = await User.create(body);
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err) {
    console.error('Error creating user:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
} 