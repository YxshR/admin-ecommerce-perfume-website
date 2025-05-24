// This file can only be used in Server Components and API Routes
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from './auth-utils';

// Get session from server-side cookies
export async function getServerSession() {
  try {
    console.log('Getting server session');
    // In Next.js 15+, cookies() is async, but in earlier versions it was sync
    // We'll handle it safely by always using .get() directly
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('token');
    
    if (!tokenCookie) {
      console.log('No token cookie found');
      return null;
    }
    
    const token = tokenCookie.value;
    if (!token) {
      console.log('Token cookie has no value');
      return null;
    }
    
    // Verify and decrypt token
    console.log('Decrypting token');
    const payload = await decrypt(token);
    
    if (!payload) {
      console.log('Invalid token payload');
      return null;
    }
    
    console.log('Valid session found for user:', payload.email);
    // Return user data
    return {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

// Server-side authentication check with redirect
export async function requireAuthentication(redirectTo = '/login') {
  const session = await getServerSession();
  
  if (!session) {
    console.log('Authentication required, redirecting to:', redirectTo);
    redirect(redirectTo);
  }
  
  return session;
}

// Server-side admin check with redirect
export async function requireAdmin(redirectTo = '/') {
  const session = await getServerSession();
  
  if (!session || session.role !== 'admin') {
    console.log('Admin access required, redirecting to:', redirectTo);
    redirect(redirectTo);
  }
  
  return session;
} 