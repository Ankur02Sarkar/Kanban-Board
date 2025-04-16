import * as jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { IUser } from '../models/User';

// Make sure to set these environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_for_dev_only';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

interface TokenPayload {
  userId: string;
}

export function generateToken(user: IUser): string {
  const payload: TokenPayload = {
    userId: user._id?.toString() || '',
  };

  return jwt.sign(payload, JWT_SECRET as jwt.Secret);
}

export async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'strict',
  });
}

export async function getTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as TokenPayload;
  } catch (_error) {
    return null;
  }
}

export async function removeTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

export function handleUnauthorized() {
  return NextResponse.json(
    { success: false, message: 'Unauthorized' },
    { status: 401 }
  );
} 