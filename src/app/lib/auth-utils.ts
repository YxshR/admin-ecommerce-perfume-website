import * as jose from 'jose';

// Secret used for JWT signing
const getSecret = () => {
  const secretKey = process.env.JWT_SECRET;
  
  if (!secretKey) {
    console.error('JWT_SECRET is not defined in environment variables!');
    // Fallback for development only - DO NOT use in production
    return new TextEncoder().encode('your_jwt_secret_key_should_be_very_long_and_random');
  }
  
  return new TextEncoder().encode(secretKey);
};

// Token expiration time (24 hours)
export const expTime = '24h';
// Token expiration in milliseconds (24 hours)
export const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generate a JWT token containing user data
 */
export async function encrypt(payload: any) {
  try {
    console.log('Generating JWT token for user:', payload.email);
    const secret = getSecret();
    
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expTime)
      .sign(secret);
    
    console.log('JWT token generated successfully');
    return token;
  } catch (error) {
    console.error('Error encoding JWT:', error);
    throw new Error('Failed to generate token');
  }
}

/**
 * Verify and decode a JWT token
 */
export async function decrypt(token: string) {
  try {
    const secret = getSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Verify if a JWT token is valid and not expired
 */
export async function isValidToken(token: string) {
  try {
    const decoded = await decrypt(token);
    return !!decoded;
  } catch (error) {
    return false;
  }
}

/**
 * Get user details from a JWT token
 */
export async function getUserFromToken(token: string) {
  try {
    const decoded = await decrypt(token);
    if (!decoded) return null;
    
    return {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
} 