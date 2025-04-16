import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { authenticateUser } from '@/lib/auth/middleware';
import { successResponse, serverError } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    
    // If authentication failed, the middleware would return a response
    if ('status' in auth) {
      return auth;
    }

    await connectToDatabase();
    
    // Get user data (excluding password)
    const user = await User.findById(auth.userId);
    
    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    return serverError(error as Error);
  }
} 