import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { Suspense } from 'react';
import Script from 'next/script';

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fraganote | Premium Fragrances",
  description: "Discover luxury fragrances and premium perfumes at Fraganote.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Add console protection in production */}
        {process.env.NODE_ENV === 'production' && (
          <Script id="console-protection" strategy="beforeInteractive">
            {`
              (function() {
                // Disable console functionality
                const disableConsole = function() {
                  // Store original console methods
                  const originalConsole = {
                    log: console.log,
                    info: console.info,
                    warn: console.warn,
                    error: console.error,
                    debug: console.debug
                  };
                  
                  // Replace with empty functions
                  console.log = console.info = console.warn = console.error = console.debug = function() {
                    return false;
                  };
                  
                  // Handle attempts to redefine console
                  Object.defineProperty(window, 'console', {
                    get: function() {
                      return {
                        log: function() { return false; },
                        info: function() { return false; },
                        warn: function() { return false; },
                        error: function() { return false; },
                        debug: function() { return false; }
                      };
                    },
                    set: function() { return false; },
                    configurable: false
                  });
                  
                  // Prevent debugging
                  const devtools = {
                    isOpen: false,
                    orientation: undefined
                  };
                  
                  // Check for devtools
                  setInterval(function() {
                    const widthThreshold = window.outerWidth - window.innerWidth > 160;
                    const heightThreshold = window.outerHeight - window.innerHeight > 160;
                    
                    if (widthThreshold || heightThreshold) {
                      if (!devtools.isOpen) {
                        devtools.isOpen = true;
                        // Refresh or take other action when devtools opens
                        window.location.reload();
                      }
                    } else {
                      if (devtools.isOpen) {
                        devtools.isOpen = false;
                      }
                    }
                  }, 1000);
                  
                  // Also hide localStorage content by replacing with proxies
                  if (window.localStorage) {
                    const sensitiveKeys = ['token', 'auth', 'user', 'userData', 'isLoggedIn'];
                    
                    const originalGetItem = Storage.prototype.getItem;
                    Storage.prototype.getItem = function(key) {
                      if (sensitiveKeys.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey))) {
                        return null;
                      }
                      return originalGetItem.call(this, key);
                    };
                  }
                };
                
                // Apply console protection
                disableConsole();
                
                // Re-apply if someone tries to restore it
                setInterval(disableConsole, 2000);
              })();
            `}
          </Script>
        )}
      </head>
      <body
        className={`${montserrat.variable} ${playfairDisplay.variable} antialiased font-sans`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
