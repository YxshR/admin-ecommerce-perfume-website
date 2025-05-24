import { NextResponse } from 'next/server';
import { TOKEN_EXPIRY } from '../../lib/auth-utils';

// Set authentication cookies in the response for API routes
export function setApiCookies(response: NextResponse, user: any, token: string) {
  try {
    // Set HTTP-only cookie for the token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds
      path: '/'
    });
    
    // Set non-HTTP-only cookie for login status check with a timestamp to ensure freshness
    // We only store a boolean value + timestamp to hide actual auth details
    response.cookies.set('isLoggedIn', `true.${Date.now()}`, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRY / 1000,
      path: '/'
    });
    
    // Set non-HTTP-only cookie for user data (only minimal non-sensitive)
    // Create a stripped-down version of user data with only necessary information
    const userData = {
      userId: typeof user._id === 'object' && user._id !== null 
        ? user._id.toString() 
        : user.userId || user._id,
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
  } catch (error) {
    // Silent error handling for security
  }
  
  return response;
}

// Clear authentication cookies in the response
export function clearApiCookies(response: NextResponse) {
  try {
    // For all cookies, set with these options to ensure proper deletion
    const cookieOptions = {
      httpOnly: true, // We set all cookies to httpOnly for deletion to be thorough
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
      sameSite: 'lax' as const
    };
    
    response.cookies.set('token', '', cookieOptions);
    response.cookies.set('isLoggedIn', '', cookieOptions);
    response.cookies.set('userData', '', cookieOptions);
    
    // Also try alternative deletion approach for better cross-browser compatibility
    response.headers.append('Set-Cookie', 'token=; Path=/; Max-Age=0; SameSite=Lax');
    response.headers.append('Set-Cookie', 'isLoggedIn=; Path=/; Max-Age=0; SameSite=Lax');
    response.headers.append('Set-Cookie', 'userData=; Path=/; Max-Age=0; SameSite=Lax');
  } catch (error) {
    // Silent error handling for security
  }
  
  return response;
} 