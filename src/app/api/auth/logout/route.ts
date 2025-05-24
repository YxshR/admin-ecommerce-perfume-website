import { NextRequest, NextResponse } from 'next/server';
import { clearApiCookies } from '../cookies-util';

export async function POST(request: NextRequest) {
  try {
    // Create a response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
    // Clear authentication cookies
    clearApiCookies(response);
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to logout' 
    }, { status: 500 });
  }
}

// Don't cache this route
export const dynamic = 'force-dynamic'; 