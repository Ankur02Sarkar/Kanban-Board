import { NextResponse } from 'next/server';

// Socket.io has its own connection handling
export function GET() {
  return NextResponse.json({ success: true, message: 'Socket.IO server is running' });
}

// Handle WebSocket connections (this is mostly a placeholder as Socket.IO handles its own connections)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 