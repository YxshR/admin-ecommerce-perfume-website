'use client';

import { useState, useEffect } from 'react';
import { Montserrat } from "next/font/google";
import "../globals.css";
import { useRouter, usePathname } from 'next/navigation';
import Script from 'next/script';

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
});

// Admin Security Wrapper Component
function AdminSecurityWrapper({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setAuthorized(true);
      setLoading(false);
      return;
    }
    
    // Function to protect admin routes
    const authCheck = () => {
      try {
        // Check cookies first (most secure)
        const isLoggedInCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('isLoggedIn='))
          ?.split('=')[1];
          
        // Then check sessionStorage (preferred for admin)
        const token = sessionStorage.getItem('token');
        const user = sessionStorage.getItem('user');
        
        // Fallback to localStorage (legacy)
        const legacyToken = localStorage.getItem('token');
        const legacyUser = localStorage.getItem('user');
        
        // Security validation
        let isAuthenticated = false;
        
        if (token && user && isLoggedInCookie?.startsWith('true')) {
          // Preferred: Use sessionStorage
          const userData = JSON.parse(user);
          if (userData.role === 'admin') {
            isAuthenticated = true;
          }
        } else if (legacyToken && legacyUser) {
          // Legacy: Use localStorage but migrate
          const userData = JSON.parse(legacyUser);
          if (userData.role === 'admin') {
            isAuthenticated = true;
            
            // Migrate to sessionStorage
            sessionStorage.setItem('token', legacyToken);
            sessionStorage.setItem('user', legacyUser);
            sessionStorage.setItem('token_timestamp', Date.now().toString());
          }
        }
        
        if (!isAuthenticated) {
          // Redirect to login page
          router.push('/admin/login');
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        // Redirect on any error
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    
    // Security: Detect devtools
    const detectDevTools = () => {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        if (widthThreshold || heightThreshold) {
          // Clear all auth
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirect to store
          window.location.href = '/';
        }
      }
    };
    
    // Run auth check on mount and on token changes
    authCheck();
    
    // Set up security measures
    window.addEventListener('resize', detectDevTools);
    window.addEventListener('storage', authCheck);
    
    const securityInterval = setInterval(detectDevTools, 1000);
    const authCheckInterval = setInterval(authCheck, 60000); // Recheck every minute
    
    // Check token expiration time
    const checkTokenExpiration = () => {
      const tokenTimestamp = sessionStorage.getItem('token_timestamp') || 
                            localStorage.getItem('token_timestamp');
      
      if (tokenTimestamp) {
        const now = Date.now();
        const tokenAge = now - parseInt(tokenTimestamp);
        
        // Expire after 2 hours (7200000 ms)
        if (tokenAge > 7200000) {
          // Clear auth and redirect
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/admin/login');
        }
      }
    };
    
    const expiryInterval = setInterval(checkTokenExpiration, 30000);
    
    return () => {
      clearInterval(securityInterval);
      clearInterval(authCheckInterval);
      clearInterval(expiryInterval);
      window.removeEventListener('resize', detectDevTools);
      window.removeEventListener('storage', authCheck);
    };
  }, [router, pathname]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Only render children if authorized
  return authorized ? <>{children}</> : null;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${montserrat.variable} font-sans`}>
      {/* Admin-specific anti-debugging script */}
      {process.env.NODE_ENV === 'production' && (
        <Script id="admin-console-protection" strategy="beforeInteractive">
          {`
            (function() {
              // Override console methods specifically for admin routes
              const originalConsole = {
                log: console.log,
                info: console.info,
                warn: console.warn,
                error: console.error,
                debug: console.debug
              };
              
              // Replace with empty functions
              console.log = console.info = console.warn = console.error = console.debug = function() {
                return "Access denied";
              };
              
              // Disable debugger statements
              setInterval(function() {
                debugger;
              }, 100);
              
              // Detect and block network inspector
              if (window.chrome && window.chrome.devtools) {
                window.location.href = '/';
              }
              
              // Prevent copying sensitive data
              document.addEventListener('copy', function(e) {
                if (window.getSelection().toString().includes('@') || 
                    window.getSelection().toString().includes('token')) {
                  e.clipboardData.setData('text/plain', 'Copying restricted data is not allowed');
                  e.preventDefault();
                }
              });
              
              // Disable right-click in admin area
              document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
              });
            })();
          `}
        </Script>
      )}
      
      <AdminSecurityWrapper>
        {children}
      </AdminSecurityWrapper>
    </div>
  );
} 