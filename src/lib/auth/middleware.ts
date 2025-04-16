import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken, handleUnauthorized } from './jwt';
import User from '../models/User';
import connectToDatabase from '../db';

export async function authenticateUser(req: NextRequest) {
  const token = await getTokenFromCookies();
  
  if (!token) {
    return handleUnauthorized();
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return handleUnauthorized();
  }

  try {
    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return handleUnauthorized();
    }
    
    return { userId: user._id.toString() };
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 