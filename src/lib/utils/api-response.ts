import { NextResponse } from 'next/server';

export function successResponse(data: any, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

export function validationError(errors: Record<string, string>) {
  return NextResponse.json(
    { success: false, message: 'Validation error', errors },
    { status: 400 }
  );
}

export function serverError(error: Error) {
  console.error('Server error:', error);
  
  return NextResponse.json(
    { success: false, message: 'Internal server error' },
    { status: 500 }
  );
} 