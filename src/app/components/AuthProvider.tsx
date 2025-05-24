'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

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

// Environment check to prevent execution in non-production environments
const isDev = process.env.NODE_ENV === 'development';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Function to check authentication status - with no debugging info exposed
  const checkAuth = () => {
    try {
      // Check for client-side cookie indicator
      const loginStatus = document.cookie
        .split('; ')
        .find(row => row.startsWith('isLoggedIn='))
        ?.split('=')[1];
      
      if (loginStatus?.startsWith('true')) {
        // Get user data from cookie
        const userDataCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('userData='))
          ?.split('=')[1];
        
        if (userDataCookie) {
          try {
            const userData = JSON.parse(decodeURIComponent(userDataCookie));
            setUser(userData);
          } catch (parseError) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status when component mounts
  useEffect(() => {
    checkAuth();
    
    // Listen for storage events to handle logout in other tabs
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);
  
  // Re-check auth status when route changes with no logging
  useEffect(() => {
    checkAuth();
  }, [pathname]);
  
  // Login function with no sensitive data logging
  const login = async (email: string, password: string, redirectPath?: string) => {
    try {
      setIsLoading(true);
      
      // Use window.location to get the exact current URL base
      const baseUrl = window.location.origin;
      const timestamp = Date.now();
      const apiUrl = `${baseUrl}/api/auth/login?_=${timestamp}`;
      
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
        let errorMessage = 'Login failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Silent error handling
        }
        
        return { success: false, error: errorMessage };
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Immediately update the user state after successful login
        setUser(data.user);
        
        // Trigger a storage event to ensure all tabs are updated
        window.localStorage.setItem('auth_timestamp', Date.now().toString());
        
        // Directly call checkAuth to ensure state is updated immediately
        checkAuth();
        
        // Handle redirect logic in this order:
        // 1. Use explicitly provided redirectPath (from function parameter)
        // 2. Use URL query parameter redirect
        // 3. Default based on role
        
        // First check for explicitly provided redirect path
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          // Check URL parameter
          const urlRedirect = searchParams.get('redirect');
          if (urlRedirect) {
            router.push(urlRedirect);
          } else {
            // Default redirect based on role
            if (data.user.role === 'admin') {
              router.push('/admin/dashboard');
            } else {
              router.push('/account');
            }
          }
        }
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function with no logging
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Use window.location to get the current URL base
      const baseUrl = window.location.origin;
      const timestamp = Date.now();
      const apiUrl = `${baseUrl}/api/auth/logout?_=${timestamp}`;
      
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
      
      // Trigger a storage event to ensure all tabs are updated
      window.localStorage.setItem('auth_timestamp', Date.now().toString());
      
      router.push('/');
      router.refresh();
    } catch (error) {
      // Silent error handling for security
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