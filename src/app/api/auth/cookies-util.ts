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
    
    // Set non-HTTP-only cookie for login status check with a timestamp to ensure freshness
    response.cookies.set('isLoggedIn', `true.${Date.now()}`, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRY / 1000,
      path: '/'
    });
    console.log('Set isLoggedIn cookie');
    
    // Set non-HTTP-only cookie for user data (non-sensitive)
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
    
    console.log('All cookies cleared successfully');
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }
  
  return response;
} 