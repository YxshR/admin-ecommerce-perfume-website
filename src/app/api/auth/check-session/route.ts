import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // This is a client-side only route
    // The session will be checked on the client via localStorage
    return NextResponse.json({
      isLoggedIn: false,
      isAdmin: false,
      message: 'Session must be checked client-side'
    });
  } catch (error) {
    console.error('Check session error:', error);
    return NextResponse.json({
      isLoggedIn: false,
      isAdmin: false,
      error: 'Failed to check session'
    }, { status: 500 });
  }
}

// Export config for static rendering
export const dynamic = 'force-static'; 