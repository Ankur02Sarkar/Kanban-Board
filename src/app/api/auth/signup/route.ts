import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth/jwt';
import { successResponse, errorResponse, validationError, serverError } from '@/lib/utils/api-response';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    const errors: Record<string, string> = {};
    
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (password && password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('Email already in use', 409);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

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
    }, 201);
  } catch (error) {
    return serverError(error as Error);
  }
} 