import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'API routes test successful',
    routes: [
      {
        path: '/api/admin/upload',
        description: 'Main upload endpoint for admin',
        method: 'POST'
      },
      {
        path: '/api/admin/test-upload',
        description: 'Test upload endpoint',
        method: 'POST'
      },
      {
        path: '/api/test-api-routes',
        description: 'This test endpoint',
        method: 'GET'
      }
    ],
    timestamp: new Date().toISOString()
  });
} 