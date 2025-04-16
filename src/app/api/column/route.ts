import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Board from '@/lib/models/Board';
import Column from '@/lib/models/Column';
import { authenticateUser } from '@/lib/auth/middleware';
import { successResponse, errorResponse, validationError, serverError } from '@/lib/utils/api-response';

// Create a new column
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    
    if ('status' in auth) {
      return auth;
    }

    const { title, boardId } = await req.json();
    
    // Validate input
    const errors: Record<string, string> = {};
    
    if (!title) errors.title = 'Column title is required';
    if (!boardId) errors.boardId = 'Board ID is required';
    
    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    await connectToDatabase();
    
    // Verify board exists and belongs to user
    const board = await Board.findOne({ _id: boardId, user: auth.userId });
    
    if (!board) {
      return errorResponse('Board not found', 404);
    }
    
    // Find the highest order value
    const lastColumn = await Column.findOne({ board: boardId })
      .sort({ order: -1 })
      .limit(1);
    
    const newOrder = lastColumn ? lastColumn.order + 1 : 0;
    
    // Create new column
    const column = await Column.create({
      title,
      board: boardId,
      order: newOrder
    });
    
    return successResponse({
      column: {
        id: column._id,
        title: column.title,
        order: column.order,
        tasks: []
      }
    }, 201);
  } catch (error) {
    return serverError(error as Error);
  }
} 