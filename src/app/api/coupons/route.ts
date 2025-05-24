import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Coupon from '../../models/Coupon';

// Connect to MongoDB
const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb+srv://Yash:8BQEkh4JaATCGblO@yash.pweao0h.mongodb.net/ecommerce");
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
  }
};

// GET all coupons
export async function GET() {
  try {
    await connectMongo();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, coupons }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// POST a new coupon
export async function POST(request: Request) {
  try {
    await connectMongo();
    const body = await request.json();
    
    // Check if coupon already exists
    const couponExists = await Coupon.findOne({ code: body.code });
    if (couponExists) {
      return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 400 });
    }
    
    const coupon = await Coupon.create(body);
    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (err) {
    console.error('Error creating coupon:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
} 