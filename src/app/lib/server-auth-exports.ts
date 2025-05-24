// This file re-exports server-side authentication functions for compatibility
// This file should only be imported by server components and API routes

// Re-export the getServerSession function as getSession for compatibility
export { getServerSession as getSession } from './server-auth'; 