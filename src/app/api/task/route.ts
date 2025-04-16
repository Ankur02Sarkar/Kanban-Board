import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Board from '@/lib/models/Board';
import Column from '@/lib/models/Column';
import Task from '@/lib/models/Task';
import { authenticateUser } from '@/lib/auth/middleware';
import { successResponse, errorResponse, validationError, serverError } from '@/lib/utils/api-response';

// Create a new task
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    
    if ('status' in auth) {
      return auth;
    }

    const { title, description, columnId } = await req.json();
    
    // Validate input
    const errors: Record<string, string> = {};
    
    if (!title) errors.title = 'Task title is required';
    if (!columnId) errors.columnId = 'Column ID is required';
    
    if (Object.keys(errors).length > 0) {
      return validationError(errors);
    }

    await connectToDatabase();
    
    // Find the column
    const column = await Column.findById(columnId);
    
    if (!column) {
      return errorResponse('Column not found', 404);
    }
    
    // Verify user has access to this board
    const board = await Board.findOne({ _id: column.board, user: auth.userId });
    
    if (!board) {
      return errorResponse('Unauthorized', 403);
    }
    
    // Find the highest order value in this column
    const lastTask = await Task.findOne({ column: columnId })
      .sort({ order: -1 })
      .limit(1);
    
    const newOrder = lastTask ? lastTask.order + 1 : 0;
    
    // Create new task
    const task = await Task.create({
      title,
      description,
      column: columnId,
      order: newOrder
    });
    
    return successResponse({
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        column: task.column,
        order: task.order
      }
    }, 201);
  } catch (error) {
    return serverError(error as Error);
  }
} 