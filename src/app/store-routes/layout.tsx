'use client';

import { Suspense, Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic imports with SSR disabled for client components
const Nav = dynamic(() => import('@/app/components/Nav'), { 
  ssr: false,
  loading: () => <div className="h-16 bg-gray-100"></div>
});

const Footer = dynamic(() => import('@/app/components/Footer'), { 
  ssr: false,
  loading: () => <div className="h-40 bg-gray-100"></div>
});

// Error boundary component
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function ErrorFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">We're having trouble loading this page</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Try again
      </button>
    </div>
  );
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-16 bg-gray-100"></div>}>
        <Nav />
      </Suspense>
      <main className="flex-grow">
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
      <Suspense fallback={<div className="h-40 bg-gray-100"></div>}>
        <Footer />
      </Suspense>
    </div>
  );
} 