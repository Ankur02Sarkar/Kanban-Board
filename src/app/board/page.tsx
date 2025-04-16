'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { BoardProvider, useBoard } from '@/lib/context/BoardContext';
import NavBar from '@/components/NavBar';
import Column from '@/components/Column';
import TaskModal from '@/components/modals/TaskModal';
import ColumnModal from '@/components/modals/ColumnModal';
import BoardModal from '@/components/modals/BoardModal';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

// Import interfaces for the Board context
interface Task {
  id: string;
  title: string;
  description?: string;
  column: string;
  order: number;
}

interface ColumnType {
  id: string;
  title: string;
  order: number;
  tasks: Task[];
}

// Wrapper component to use the board context
const BoardPage = () => {
  return (
    <BoardProvider>
      <BoardContent />
    </BoardProvider>
  );
};

// Main component that uses the board context
const BoardContent = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { 
    board, 
    isLoading, 
    createBoard,
    createColumn,
    createTask,
    updateTask,
    deleteTask,
    updateColumn,
    deleteColumn,
    moveTask,
  } = useBoard();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalData, setTaskModalData] = useState({ columnId: '', taskId: '', title: '', description: '', isEditing: false });
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [columnModalData, setColumnModalData] = useState({ columnId: '', title: '', isEditing: false });
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [boardModalData, setBoardModalData] = useState({ title: '', isEditing: false });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // If no board exists, show the create board modal
  useEffect(() => {
    if (!isLoading && !board && user) {
      setBoardModalOpen(true);
    }
  }, [isLoading, board, user]);

  // Handle board creation/update
  const handleBoardSubmit = (title: string) => {
    createBoard(title);
  };

  // Handle column creation/update
  const handleColumnSubmit = (title: string) => {
    if (columnModalData.isEditing && columnModalData.columnId) {
      updateColumn(columnModalData.columnId, title);
    } else {
      createColumn(title);
    }
  };

  // Handle task creation/update
  const handleTaskSubmit = (title: string, description: string) => {
    if (taskModalData.isEditing && taskModalData.taskId) {
      updateTask(taskModalData.taskId, { title, description });
    } else if (taskModalData.columnId) {
      createTask(taskModalData.columnId, title, description);
    }
  };

  // Open task modal for adding a new task
  const handleAddTask = (columnId: string) => {
    setTaskModalData({ columnId, taskId: '', title: '', description: '', isEditing: false });
    setTaskModalOpen(true);
  };

  // Open task modal for editing a task
  const handleEditTask = (taskId: string) => {
    if (!board) return;
    
    // Find the task in columns
    for (const column of board.columns) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) {
        setTaskModalData({
          columnId: column.id,
          taskId,
          title: task.title,
          description: task.description || '',
          isEditing: true
        });
        setTaskModalOpen(true);
        break;
      }
    }
  };

  // Handle drag start event
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id, data } = active;
    
    if (data.current?.type === 'task') {
      setActiveTaskId(id as string);
    } else if (data.current?.type === 'column') {
      setActiveColumnId(id as string);
    }
  };

  // Handle drag over event (for moving tasks between columns)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || !active || active.id === over.id) return;
    
    const isActiveTask = active.data.current?.type === 'task';
    if (!isActiveTask) return;
    
    // Handle dropping a task over a column
    const isOverColumn = over.data.current?.type === 'column';
    const isOverTask = over.data.current?.type === 'task';
    
    if (isOverColumn) {
      // Task dropped directly over a column
      const activeTaskId = active.id as string;
      const overColumnId = over.id as string;
      
      // Find the current column of the task
      const sourceColumnId = board?.columns.find(column => 
        column.tasks.some(task => task.id === activeTaskId)
      )?.id;
      
      if (sourceColumnId && sourceColumnId !== overColumnId) {
        // Get the highest order in the target column
        const targetColumn = board?.columns.find(column => column.id === overColumnId);
        const newOrder = targetColumn?.tasks.length || 0;
        
        moveTask(activeTaskId, sourceColumnId, overColumnId, newOrder);
      }
    } else if (isOverTask) {
      // Task dropped over another task
      const activeTaskId = active.id as string;
      const overTaskId = over.id as string;
      
      // Find the columns for both tasks
      let sourceColumn: ColumnType | undefined;
      let targetColumn: ColumnType | undefined;
      let sourceTask: Task | undefined;
      let targetTask: Task | undefined;
      
      board?.columns.forEach(column => {
        column.tasks.forEach(task => {
          if (task.id === activeTaskId) {
            sourceColumn = column;
            sourceTask = task;
          }
          if (task.id === overTaskId) {
            targetColumn = column;
            targetTask = task;
          }
        });
      });
      
      if (sourceColumn && targetColumn && sourceTask && targetTask) {
        // If moving to another column
        if (sourceColumn.id !== targetColumn.id) {
          moveTask(activeTaskId, sourceColumn.id, targetColumn.id, targetTask.order);
        }
      }
    }
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTaskId(null);
    setActiveColumnId(null);
    
    if (!over) return;
    
    const isActiveTask = active.data.current?.type === 'task';
    
    if (isActiveTask) {
      const activeTaskId = active.id as string;
      const isOverTask = over.data.current?.type === 'task';
      
      if (isOverTask && active.id !== over.id) {
        // Task dropped over another task in the same column
        const overTaskId = over.id as string;
        
        // Find both tasks and their columns
        let sourceColumn: ColumnType | undefined;
        let sourceTask: Task | undefined;
        let overTask: Task | undefined;
        
        board?.columns.forEach(column => {
          column.tasks.forEach(task => {
            if (task.id === activeTaskId) {
              sourceColumn = column;
              sourceTask = task;
            }
            if (task.id === overTaskId) {
              overTask = task;
            }
          });
        });
        
        if (sourceColumn && sourceTask && overTask && 
            sourceTask.column === overTask.column && 
            sourceTask.order !== overTask.order) {
          // If in same column, update order
          updateTask(activeTaskId, { order: overTask.order });
        }
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <NavBar 
        showBoardOptions={!!board}
        boardTitle={board?.title}
        onAddColumn={() => setColumnModalOpen(true)}
        onBoardTitleClick={() => {
          if (board) {
            setBoardModalData({ title: board.title, isEditing: true });
            setBoardModalOpen(true);
          }
        }}
      />
      
      <main className="flex-1 overflow-x-auto py-6 px-4">
        {board ? (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex space-x-4 min-h-[calc(100vh-10rem)]">
              <SortableContext 
                items={board.columns.map(col => col.id)} 
                strategy={horizontalListSortingStrategy}
              >
                {board.columns.map((column) => (
                  <Column
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    tasks={column.tasks}
                    onAddTask={handleAddTask}
                    onEditColumn={(columnId, title) => {
                      updateColumn(columnId, title);
                    }}
                    onDeleteColumn={deleteColumn}
                    onEditTask={handleEditTask}
                    onDeleteTask={deleteTask}
                  />
                ))}
              </SortableContext>
              
              {board.columns.length === 0 && (
                <div className="flex items-center justify-center w-full">
                  <button
                    onClick={() => setColumnModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                  >
                    Add Your First Column
                  </button>
                </div>
              )}
            </div>
          </DndContext>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">No Board Yet</h2>
              <button
                onClick={() => setBoardModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
              >
                Create a Board
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        title={taskModalData.title}
        description={taskModalData.description}
        isEditing={taskModalData.isEditing}
      />
      
      {/* Column Modal */}
      <ColumnModal
        isOpen={columnModalOpen}
        onClose={() => setColumnModalOpen(false)}
        onSubmit={handleColumnSubmit}
        title={columnModalData.title}
        isEditing={columnModalData.isEditing}
      />
      
      {/* Board Modal */}
      <BoardModal
        isOpen={boardModalOpen}
        onClose={() => setBoardModalOpen(false)}
        onSubmit={handleBoardSubmit}
        title={boardModalData.title}
        isEditing={boardModalData.isEditing}
      />
    </div>
  );
};

export default BoardPage; 