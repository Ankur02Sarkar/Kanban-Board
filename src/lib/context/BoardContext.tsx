'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { socketInit, joinBoard, leaveBoard, onTaskCreated, onTaskUpdated, onTaskDeleted, onColumnCreated, onColumnUpdated, onColumnDeleted } from '../socket/socket-client';

interface Task {
  id: string;
  title: string;
  description?: string;
  column: string;
  order: number;
}

interface Column {
  id: string;
  title: string;
  order: number;
  tasks: Task[];
}

interface Board {
  id: string;
  title: string;
  columns: Column[];
}

interface BoardContextType {
  board: Board | null;
  isLoading: boolean;
  error: string | null;
  createBoard: (title: string) => Promise<void>;
  createColumn: (title: string) => Promise<void>;
  createTask: (columnId: string, title: string, description?: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateColumn: (columnId: string, title: string) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string, newOrder: number) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket and fetch board data
  useEffect(() => {
    if (!user) {
      setBoard(null);
      setIsLoading(false);
      return;
    }

    const fetchBoard = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/board');
        const data = await response.json();

        if (data.success && data.data.board) {
          setBoard(data.data.board);
          // Initialize socket connection
          socketInit();
          // Join board room
          joinBoard(data.data.board.id);
        } else {
          setBoard(null);
        }
      } catch (error) {
        console.error('Failed to fetch board:', error);
        setError('Failed to load board');
        toast.error('Failed to load board');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoard();

    // Cleanup function
    return () => {
      if (board) {
        leaveBoard(board.id);
      }
    };
  }, [user]);

  // Socket event listeners
  useEffect(() => {
    if (!board) return;

    // Set up socket event listeners
    const taskCreatedCleanup = onTaskCreated((task) => {
      setBoard((prevBoard) => {
        if (!prevBoard) return null;

        const updatedColumns = prevBoard.columns.map((col) => {
          if (col.id === task.column) {
            return {
              ...col,
              tasks: [...col.tasks, {
                id: task.id,
                title: task.title,
                description: task.description,
                column: task.column,
                order: task.order
              }].sort((a, b) => a.order - b.order)
            };
          }
          return col;
        });

        return {
          ...prevBoard,
          columns: updatedColumns
        };
      });
    });

    const taskUpdatedCleanup = onTaskUpdated((task) => {
      setBoard((prevBoard) => {
        if (!prevBoard) return null;

        // Handle task moving between columns
        const sourceColumn = prevBoard.columns.find(col => 
          col.tasks.some(t => t.id === task.id)
        );
        const destinationColumn = prevBoard.columns.find(col => 
          col.id === task.column
        );

        if (sourceColumn && destinationColumn && sourceColumn.id !== destinationColumn.id) {
          // Task moved to a different column
          const updatedColumns = prevBoard.columns.map(col => {
            if (col.id === sourceColumn.id) {
              // Remove task from source column
              return {
                ...col,
                tasks: col.tasks.filter(t => t.id !== task.id)
              };
            }
            if (col.id === destinationColumn.id) {
              // Add task to destination column
              return {
                ...col,
                tasks: [...col.tasks, {
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  column: task.column as string,
                  order: task.order
                }].sort((a, b) => a.order - b.order)
              };
            }
            return col;
          });

          return {
            ...prevBoard,
            columns: updatedColumns
          };
        }

        // Task was updated but didn't change columns
        const updatedColumns = prevBoard.columns.map(col => {
          if (col.tasks.some(t => t.id === task.id)) {
            return {
              ...col,
              tasks: col.tasks.map(t => 
                t.id === task.id 
                  ? {
                      ...t,
                      title: task.title,
                      description: task.description,
                      order: task.order
                    }
                  : t
              ).sort((a, b) => a.order - b.order)
            };
          }
          return col;
        });

        return {
          ...prevBoard,
          columns: updatedColumns
        };
      });
    });

    const taskDeletedCleanup = onTaskDeleted(({ taskId }) => {
      setBoard((prevBoard) => {
        if (!prevBoard) return null;

        const updatedColumns = prevBoard.columns.map(col => ({
          ...col,
          tasks: col.tasks.filter(task => task.id !== taskId)
        }));

        return {
          ...prevBoard,
          columns: updatedColumns
        };
      });
    });

    const columnCreatedCleanup = onColumnCreated((column) => {
      setBoard((prevBoard) => {
        if (!prevBoard) return null;

        return {
          ...prevBoard,
          columns: [...prevBoard.columns, {
            id: column.id,
            title: column.title,
            order: column.order,
            tasks: []
          }].sort((a, b) => a.order - b.order)
        };
      });
    });

    const columnUpdatedCleanup = onColumnUpdated((column) => {
      setBoard((prevBoard) => {
        if (!prevBoard) return null;

        const updatedColumns = prevBoard.columns.map(col => 
          col.id === column.id 
            ? { ...col, title: column.title, order: column.order }
            : col
        ).sort((a, b) => a.order - b.order);

        return {
          ...prevBoard,
          columns: updatedColumns
        };
      });
    });

    const columnDeletedCleanup = onColumnDeleted(({ columnId }) => {
      setBoard((prevBoard) => {
        if (!prevBoard) return null;

        return {
          ...prevBoard,
          columns: prevBoard.columns.filter(col => col.id !== columnId)
        };
      });
    });

    // Cleanup event listeners
    return () => {
      taskCreatedCleanup();
      taskUpdatedCleanup();
      taskDeletedCleanup();
      columnCreatedCleanup();
      columnUpdatedCleanup();
      columnDeletedCleanup();
    };
  }, [board]);

  // Create a new board
  const createBoard = async (title: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (data.success) {
        // Fetch the complete board with columns
        const boardResponse = await fetch('/api/board');
        const boardData = await boardResponse.json();

        if (boardData.success && boardData.data.board) {
          setBoard(boardData.data.board);
          toast.success('Board created successfully');
        }
      } else {
        toast.error(data.message || 'Failed to create board');
      }
    } catch (error) {
      console.error('Failed to create board:', error);
      setError('Failed to create board');
      toast.error('Failed to create board');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new column
  const createColumn = async (title: string) => {
    if (!board) {
      toast.error('No active board');
      return;
    }

    try {
      const response = await fetch('/api/column', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, boardId: board.id }),
      });

      const data = await response.json();

      if (data.success) {
        // Optimistically update the UI
        const newColumn = data.data.column;
        setBoard(prevBoard => {
          if (!prevBoard) return null;
          return {
            ...prevBoard,
            columns: [...prevBoard.columns, {
              ...newColumn,
              tasks: []
            }]
          };
        });
      } else {
        toast.error(data.message || 'Failed to create column');
      }
    } catch (error) {
      console.error('Failed to create column:', error);
      toast.error('Failed to create column');
    }
  };

  // Create a new task
  const createTask = async (columnId: string, title: string, description?: string) => {
    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, columnId }),
      });

      const data = await response.json();

      if (data.success) {
        // Optimistically update the UI
        const newTask = data.data.task;
        setBoard(prevBoard => {
          if (!prevBoard) return null;
          
          return {
            ...prevBoard,
            columns: prevBoard.columns.map(col => {
              if (col.id === columnId) {
                return {
                  ...col,
                  tasks: [...col.tasks, newTask]
                };
              }
              return col;
            })
          };
        });
      } else {
        toast.error(data.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  // Update a task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/task/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        // Optimistically update the UI
        setBoard(prevBoard => {
          if (!prevBoard) return null;
          
          return {
            ...prevBoard,
            columns: prevBoard.columns.map(col => {
              return {
                ...col,
                tasks: col.tasks.map(task => {
                  if (task.id === taskId) {
                    return { ...task, ...updates };
                  }
                  return task;
                })
              };
            })
          };
        });
      } else {
        toast.error(data.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/task/${taskId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Optimistically update the UI
        setBoard(prevBoard => {
          if (!prevBoard) return null;
          
          return {
            ...prevBoard,
            columns: prevBoard.columns.map(col => {
              return {
                ...col,
                tasks: col.tasks.filter(task => task.id !== taskId)
              };
            })
          };
        });
      } else {
        toast.error(data.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Update a column
  const updateColumn = async (columnId: string, title: string) => {
    try {
      const response = await fetch(`/api/column/${columnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (data.success) {
        // Optimistically update the UI
        setBoard(prevBoard => {
          if (!prevBoard) return null;
          
          return {
            ...prevBoard,
            columns: prevBoard.columns.map(col => {
              if (col.id === columnId) {
                return { ...col, title };
              }
              return col;
            })
          };
        });
      } else {
        toast.error(data.message || 'Failed to update column');
      }
    } catch (error) {
      console.error('Failed to update column:', error);
      toast.error('Failed to update column');
    }
  };

  // Delete a column
  const deleteColumn = async (columnId: string) => {
    try {
      const response = await fetch(`/api/column/${columnId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Optimistically update the UI
        setBoard(prevBoard => {
          if (!prevBoard) return null;
          
          return {
            ...prevBoard,
            columns: prevBoard.columns.filter(col => col.id !== columnId)
          };
        });
      } else {
        toast.error(data.message || 'Failed to delete column');
      }
    } catch (error) {
      console.error('Failed to delete column:', error);
      toast.error('Failed to delete column');
    }
  };

  // Move a task between columns
  const moveTask = async (taskId: string, sourceColumnId: string, destinationColumnId: string, newOrder: number) => {
    try {
      console.log("Moving task:", { taskId, sourceColumnId, destinationColumnId, newOrder });
      
      // Find the task that's being moved
      let taskToMove: Task | null = null;
      let sourceColumn: Column | null = null;
      let destinationColumn: Column | null = null;
      
      if (board) {
        sourceColumn = board.columns.find(col => col.id === sourceColumnId) || null;
        destinationColumn = board.columns.find(col => col.id === destinationColumnId) || null;
        
        if (sourceColumn) {
          taskToMove = sourceColumn.tasks.find(task => task.id === taskId) || null;
        }
      }
      
      if (!taskToMove) {
        console.error("Task not found:", taskId);
        return;
      }
      
      // Check if moving within the same column or to a different column
      const isSameColumn = sourceColumnId === destinationColumnId;
      
      // Optimistically update the UI
      setBoard(prevBoard => {
        if (!prevBoard) return null;
        
        // Clone the board for immutability
        const newBoard = { ...prevBoard };
        
        if (isSameColumn) {
          // Same column - just update the order
          const columnIndex = newBoard.columns.findIndex(col => col.id === sourceColumnId);
          if (columnIndex === -1) return prevBoard;
          
          // Get the tasks and reorder them
          const tasks = [...newBoard.columns[columnIndex].tasks];
          const taskIndex = tasks.findIndex(t => t.id === taskId);
          if (taskIndex === -1) return prevBoard;
          
          // Remove the task from its current position
          const [removed] = tasks.splice(taskIndex, 1);
          
          // Get the new position
          const insertPosition = Math.min(tasks.length, newOrder);
          
          // Add the task at the new position
          tasks.splice(insertPosition, 0, {
            ...removed,
            order: newOrder
          });
          
          // Update tasks with new order values
          const updatedTasks = tasks.map((task, index) => ({
            ...task,
            order: index
          }));
          
          // Update the column
          newBoard.columns[columnIndex].tasks = updatedTasks;
        } else {
          // Different columns
          const sourceColumnIndex = newBoard.columns.findIndex(col => col.id === sourceColumnId);
          const destColumnIndex = newBoard.columns.findIndex(col => col.id === destinationColumnId);
          
          if (sourceColumnIndex === -1 || destColumnIndex === -1) return prevBoard;
          
          // Remove task from source column
          const sourceTasks = [...newBoard.columns[sourceColumnIndex].tasks];
          const taskIndex = sourceTasks.findIndex(t => t.id === taskId);
          if (taskIndex === -1) return prevBoard;
          
          const [removed] = sourceTasks.splice(taskIndex, 1);
          
          // Update source column tasks with new order values
          const updatedSourceTasks = sourceTasks.map((task, index) => ({
            ...task,
            order: index
          }));
          
          // Add task to destination column
          const destTasks = [...newBoard.columns[destColumnIndex].tasks];
          const insertPosition = Math.min(destTasks.length, newOrder);
          
          destTasks.splice(insertPosition, 0, {
            ...removed,
            column: destinationColumnId,
            order: newOrder
          });
          
          // Update destination column tasks with new order values
          const updatedDestTasks = destTasks.map((task, index) => ({
            ...task,
            order: index
          }));
          
          // Update both columns
          newBoard.columns[sourceColumnIndex].tasks = updatedSourceTasks;
          newBoard.columns[destColumnIndex].tasks = updatedDestTasks;
        }
        
        return newBoard;
      });
      
      // Send API request
      const response = await fetch(`/api/task/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          columnId: destinationColumnId,
          order: newOrder
        }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message || 'Failed to move task');
        // Could revert the optimistic update here if needed
      }
    } catch (error) {
      console.error('Failed to move task:', error);
      toast.error('Failed to move task');
    }
  };

  return (
    <BoardContext.Provider value={{
      board,
      isLoading,
      error,
      createBoard,
      createColumn,
      createTask,
      updateTask,
      deleteTask,
      updateColumn,
      deleteColumn,
      moveTask,
    }}>
      {children}
    </BoardContext.Provider>
  );
};

// Custom hook to use the board context
export const useBoard = () => {
  const context = useContext(BoardContext);
  
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  
  return context;
}; 