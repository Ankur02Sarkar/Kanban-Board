import { NextRequest } from 'next/server';
import { removeTokenCookie } from '@/lib/auth/jwt';
import { successResponse } from '@/lib/utils/api-response';

export async function POST(req: NextRequest) {
  // Remove the authentication cookie
  await removeTokenCookie();
  
  return successResponse({ message: 'Logged out successfully' });
} 