import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { ITask } from '../models/Task';
import { IColumn } from '../models/Column';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const initSocketServer = (server: NetServer) => {
  if (!(server as any).io) {
    console.log('Socket.io server initializing');

    const io = new SocketIOServer(server);
    (server as any).io = io;

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('join-board', (boardId: string) => {
        socket.join(`board-${boardId}`);
        console.log(`Client ${socket.id} joined board: ${boardId}`);
      });

      socket.on('leave-board', (boardId: string) => {
        socket.leave(`board-${boardId}`);
        console.log(`Client ${socket.id} left board: ${boardId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return (server as any).io;
};

// Socket event emitters for tasks
export const emitTaskCreated = (boardId: string, task: ITask) => {
  const io = global.socketIo;
  if (io) {
    io.to(`board-${boardId}`).emit('task-created', task);
  }
};

export const emitTaskUpdated = (boardId: string, task: ITask) => {
  const io = global.socketIo;
  if (io) {
    io.to(`board-${boardId}`).emit('task-updated', task);
  }
};

export const emitTaskDeleted = (boardId: string, taskId: string) => {
  const io = global.socketIo;
  if (io) {
    io.to(`board-${boardId}`).emit('task-deleted', { taskId });
  }
};

// Socket event emitters for columns
export const emitColumnCreated = (boardId: string, column: IColumn) => {
  const io = global.socketIo;
  if (io) {
    io.to(`board-${boardId}`).emit('column-created', column);
  }
};

export const emitColumnUpdated = (boardId: string, column: IColumn) => {
  const io = global.socketIo;
  if (io) {
    io.to(`board-${boardId}`).emit('column-updated', column);
  }
};

export const emitColumnDeleted = (boardId: string, columnId: string) => {
  const io = global.socketIo;
  if (io) {
    io.to(`board-${boardId}`).emit('column-deleted', { columnId });
  }
};