import { NextResponse } from 'next/server';
import { TOKEN_EXPIRY } from '../../lib/auth-utils';

// Set authentication cookies in the response for API routes
export function setApiCookies(response: NextResponse, user: any, token: string) {
  console.log('Setting authentication cookies');
  
  try {
    // Set HTTP-only cookie for the token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds
      path: '/'
    });
    console.log('Set token cookie (httpOnly)');
    
    // Set non-HTTP-only cookie for login status check
    response.cookies.set('isLoggedIn', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRY / 1000,
      path: '/'
    });
    console.log('Set isLoggedIn cookie');
    
    // Set non-HTTP-only cookie for user data (non-sensitive)
    const userData = {
      userId: user.userId || user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    response.cookies.set('userData', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRY / 1000,
      path: '/'
    });
    console.log('Set userData cookie with data for:', userData.email);
  } catch (error) {
    console.error('Error setting cookies:', error);
  }
  
  return response;
}

// Clear authentication cookies in the response
export function clearApiCookies(response: NextResponse) {
  console.log('Clearing authentication cookies');
  
  try {
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/'
    });
    
    response.cookies.set('isLoggedIn', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/'
    });
    
    response.cookies.set('userData', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/'
    });
    
    console.log('All cookies cleared successfully');
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }
  
  return response;
} 