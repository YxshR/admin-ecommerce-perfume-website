'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, redirectPath?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check for client-side cookie indicator
        const loginStatus = document.cookie
          .split('; ')
          .find(row => row.startsWith('isLoggedIn='))
          ?.split('=')[1];
        
        console.log('Checking auth status, isLoggedIn cookie:', loginStatus);
        
        if (loginStatus === 'true') {
          // Get user data from cookie
          const userDataCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('userData='))
            ?.split('=')[1];
          
          if (userDataCookie) {
            try {
              const userData = JSON.parse(decodeURIComponent(userDataCookie));
              console.log('User data found in cookie:', userData?.email);
              setUser(userData);
            } catch (parseError) {
              console.error('Failed to parse user data cookie:', parseError);
              setUser(null);
            }
          } else {
            console.log('No user data cookie found');
            setUser(null);
          }
        } else {
          console.log('Not logged in');
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for storage events to handle logout in other tabs
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);
  
  // Login function
  const login = async (email: string, password: string, redirectPath?: string) => {
    try {
      setIsLoading(true);
      console.log('Login attempt for:', email);
      
      // Use window.location to get the exact current URL base
      // This ensures we're using whatever port the page is currently on
      const baseUrl = window.location.origin;
      const timestamp = Date.now();
      const apiUrl = `${baseUrl}/api/auth/login?_=${timestamp}`;
      
      console.log('Sending login request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies
        cache: 'no-store'
      });
      
      if (!response.ok) {
        console.error('Login API error:', response.status, response.statusText);
        let errorMessage = 'Login failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
        return { success: false, error: errorMessage };
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Login successful');
        setUser(data.user);
        
        // Handle redirect logic in this order:
        // 1. Use explicitly provided redirectPath (from function parameter)
        // 2. Use URL query parameter redirect
        // 3. Default based on role
        
        // First check for explicitly provided redirect path
        if (redirectPath) {
          console.log('Redirecting to explicit path:', redirectPath);
          router.push(redirectPath);
        } else {
          // Check URL parameter
          const urlRedirect = searchParams.get('redirect');
          if (urlRedirect) {
            console.log('Redirecting to URL param path:', urlRedirect);
            router.push(urlRedirect);
          } else {
            // Default redirect based on role
            if (data.user.role === 'admin') {
              console.log('Redirecting admin to dashboard');
              router.push('/admin/dashboard');
            } else {
              console.log('Redirecting user to account');
              router.push('/account');
            }
          }
        }
        
        return { success: true };
      } else {
        console.error('Login failed:', data.error);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('Logging out...');
      
      // Use window.location to get the current URL base
      const baseUrl = window.location.origin;
      const timestamp = Date.now();
      const apiUrl = `${baseUrl}/api/auth/logout?_=${timestamp}`;
      
      console.log('Sending logout request to:', apiUrl);
      
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache'
        },
        credentials: 'include', // Important for cookies
        cache: 'no-store'
      });
      
      // Clear client-side cookies
      document.cookie = 'isLoggedIn=; Path=/; Max-Age=0; SameSite=Lax';
      document.cookie = 'userData=; Path=/; Max-Age=0; SameSite=Lax';
      
      setUser(null);
      console.log('Logout successful');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: !!user && user.role === 'admin',
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 