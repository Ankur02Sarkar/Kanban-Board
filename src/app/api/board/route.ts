import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Board from '@/lib/models/Board';
import Column from '@/lib/models/Column';
import Task from '@/lib/models/Task';
import { authenticateUser } from '@/lib/auth/middleware';
import { successResponse, errorResponse, validationError, serverError } from '@/lib/utils/api-response';

// Get user's board with columns and tasks
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    
    if ('status' in auth) {
      return auth;
    }

    await connectToDatabase();
    
    // Find user's board
    const board = await Board.findOne({ user: auth.userId });
    
    if (!board) {
      return successResponse({ board: null });
    }
    
    // Get columns for this board
    const columns = await Column.find({ board: board._id }).sort({ order: 1 });
    
    // Get tasks for all columns
    const columnIds = columns.map(col => col._id);
    const tasks = await Task.find({ column: { $in: columnIds } }).sort({ order: 1 });
    
    // Group tasks by column
    const tasksByColumn = columns.reduce((acc, column) => {
      acc[column._id.toString()] = tasks.filter(
        task => task.column.toString() === column._id.toString()
      );
      return acc;
    }, {} as Record<string, any[]>);
    
    return successResponse({
      board: {
        id: board._id,
        title: board.title,
        columns: columns.map(column => ({
          id: column._id,
          title: column.title,
          order: column.order,
          tasks: tasksByColumn[column._id.toString()] || []
        }))
      }
    });
  } catch (error) {
    return serverError(error as Error);
  }
}

// Create a new board or update existing one
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    
    if ('status' in auth) {
      return auth;
    }

    const { title } = await req.json();
    
    // Validate input
    if (!title) {
      return validationError({ title: 'Board title is required' });
    }

    await connectToDatabase();
    
    // Check if user already has a board
    let board = await Board.findOne({ user: auth.userId });
    
    if (board) {
      // Update existing board
      board.title = title;
      await board.save();
    } else {
      // Create new board
      board = await Board.create({
        title,
        user: auth.userId
      });
      
      // Create default columns
      await Column.create([
        { title: 'To Do', board: board._id, order: 0 },
        { title: 'In Progress', board: board._id, order: 1 },
        { title: 'Done', board: board._id, order: 2 }
      ]);
    }
    
    return successResponse({
      board: {
        id: board._id,
        title: board.title
      }
    }, board ? 200 : 201);
  } catch (error) {
    return serverError(error as Error);
  }
} 