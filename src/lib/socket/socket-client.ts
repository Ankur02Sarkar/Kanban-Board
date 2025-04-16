import { io, Socket } from 'socket.io-client';
import { ITask } from '../models/Task';
import { IColumn } from '../models/Column';

let socket: Socket | null = null;

export const socketInit = (): Socket => {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      addTrailingSlash: false,
    });
  }
  
  return socket;
};

export const joinBoard = (boardId: string) => {
  if (!socket) {
    socketInit();
  }
  
  socket?.emit('join-board', boardId);
};

export const leaveBoard = (boardId: string) => {
  socket?.emit('leave-board', boardId);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event handlers for socket events
export const onTaskCreated = (callback: (task: ITask) => void) => {
  socket?.on('task-created', callback);
  
  return () => {
    socket?.off('task-created', callback);
  };
};

export const onTaskUpdated = (callback: (task: ITask) => void) => {
  socket?.on('task-updated', callback);
  
  return () => {
    socket?.off('task-updated', callback);
  };
};

export const onTaskDeleted = (callback: (data: { taskId: string }) => void) => {
  socket?.on('task-deleted', callback);
  
  return () => {
    socket?.off('task-deleted', callback);
  };
};

export const onColumnCreated = (callback: (column: IColumn) => void) => {
  socket?.on('column-created', callback);
  
  return () => {
    socket?.off('column-created', callback);
  };
};

export const onColumnUpdated = (callback: (column: IColumn) => void) => {
  socket?.on('column-updated', callback);
  
  return () => {
    socket?.off('column-updated', callback);
  };
};

export const onColumnDeleted = (callback: (data: { columnId: string }) => void) => {
  socket?.on('column-deleted', callback);
  
  return () => {
    socket?.off('column-deleted', callback);
  };
}; 