import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Board from '@/lib/models/Board';
import Column from '@/lib/models/Column';
import Task from '@/lib/models/Task';
import { authenticateUser } from '@/lib/auth/middleware';
import { successResponse, errorResponse, validationError, serverError } from '@/lib/utils/api-response';

interface Params {
  params: {
    id: string;
  };
}

// Update a task
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const auth = await authenticateUser(req);
    
    if ('status' in auth) {
      return auth;
    }

    const { title, description, columnId, order } = await req.json();
    const taskId = params.id;

    await connectToDatabase();
    
    // Find the task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return errorResponse('Task not found', 404);
    }
    
    // Find the column
    const column = await Column.findById(task.column);
    
    if (!column) {
      return errorResponse('Column not found', 404);
    }
    
    // Verify user has access to this board
    const board = await Board.findOne({ _id: column.board, user: auth.userId });
    
    if (!board) {
      return errorResponse('Unauthorized', 403);
    }
    
    // Store the original column ID
    const originalColumnId = task.column.toString();
    const newColumnId = columnId || originalColumnId;
    
    // Check if new column exists and is part of the same board
    if (columnId && columnId !== originalColumnId) {
      const newColumn = await Column.findById(columnId);
      
      if (!newColumn) {
        return errorResponse('Column not found', 404);
      }
      
      if (newColumn.board.toString() !== column.board.toString()) {
        return errorResponse('Cannot move task to another board', 400);
      }
    }
    
    // Update task
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    
    // Handle task movement between columns
    if (columnId && columnId !== originalColumnId) {
      // Moving to a new column
      task.column = columnId;
      
      // Find highest order in new column
      const lastTask = await Task.findOne({ column: columnId })
        .sort({ order: -1 })
        .limit(1);
      
      task.order = lastTask ? lastTask.order + 1 : 0;
      
      // Reorder tasks in the original column
      const originalColumnTasks = await Task.find({ column: originalColumnId }).sort({ order: 1 });
      
      for (let i = 0; i < originalColumnTasks.length; i++) {
        originalColumnTasks[i].order = i;
        await originalColumnTasks[i].save();
      }
    } else if (order !== undefined) {
      // Order changed within the same column
      const tasks = await Task.find({ column: task.column }).sort({ order: 1 });
      
      // Remove task from current position
      const filteredTasks = tasks.filter(t => t._id.toString() !== taskId);
      
      // Insert at new position
      filteredTasks.splice(order, 0, task);
      
      // Update order for all tasks
      for (let i = 0; i < filteredTasks.length; i++) {
        filteredTasks[i].order = i;
        await filteredTasks[i].save();
      }
    }
    
    await task.save();
    
    return successResponse({
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        column: task.column,
        order: task.order
      }
    });
  } catch (error) {
    return serverError(error as Error);
  }
}

// Delete a task
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await authenticateUser(req);
    
    if ('status' in auth) {
      return auth;
    }

    const taskId = params.id;

    await connectToDatabase();
    
    // Find the task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return errorResponse('Task not found', 404);
    }
    
    // Find the column
    const column = await Column.findById(task.column);
    
    if (!column) {
      return errorResponse('Column not found', 404);
    }
    
    // Verify user has access to this board
    const board = await Board.findOne({ _id: column.board, user: auth.userId });
    
    if (!board) {
      return errorResponse('Unauthorized', 403);
    }
    
    // Delete the task
    await Task.findByIdAndDelete(taskId);
    
    // Reorder remaining tasks
    const remainingTasks = await Task.find({ column: task.column }).sort({ order: 1 });
    
    for (let i = 0; i < remainingTasks.length; i++) {
      remainingTasks[i].order = i;
      await remainingTasks[i].save();
    }
    
    return successResponse({ success: true });
  } catch (error) {
    return serverError(error as Error);
  }
} 