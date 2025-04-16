import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth/jwt';
import { successResponse, errorResponse, validationError, serverError } from '@/lib/utils/api-response';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    const errors: Record<string, string> = {};
    
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    
    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    await connectToDatabase();

    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return errorResponse('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = generateToken(user);
    
    // Set cookie
    await setTokenCookie(token);

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