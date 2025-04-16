import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Board from '@/lib/models/Board';
import Column from '@/lib/models/Column';
import Task from '@/lib/models/Task';
import { authenticateUser } from '@/lib/auth/middleware';
import { successResponse, errorResponse, validationError, serverError } from '@/lib/utils/api-response';

// Update a column
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateUser(req);
    
    if ('status' in auth) {
      return auth;
    }

    const { title } = await req.json();
    const { id: columnId } = await params;
    
    // Validate input
    if (!title) {
      return validationError({ title: 'Column title is required' });
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
    
    // Update column
    column.title = title;
    await column.save();
    
    return successResponse({
      column: {
        id: column._id,
        title: column.title,
        order: column.order
      }
    });
  } catch (error) {
    return serverError(error as Error);
  }
}

// Delete a column
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateUser(req);
    
    if ('status' in auth) {
      return auth;
    }

    const { id: columnId } = await params;

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
    
    // Delete all tasks in this column
    await Task.deleteMany({ column: columnId });
    
    // Delete the column
    await Column.findByIdAndDelete(columnId);
    
    // Reorder remaining columns
    const remainingColumns = await Column.find({ board: column.board }).sort({ order: 1 });
    
    for (let i = 0; i < remainingColumns.length; i++) {
      remainingColumns[i].order = i;
      await remainingColumns[i].save();
    }
    
    return successResponse({ success: true });
  } catch (error) {
    return serverError(error as Error);
  }
} 