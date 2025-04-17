'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { BoardProvider, useBoard } from '@/lib/context/BoardContext';
import NavBar from '@/components/NavBar';
import Column from '@/components/Column';
import Task from '@/components/Task';
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
  closestCenter,
  MeasuringStrategy,
  KeyboardSensor,
  defaultDropAnimationSideEffects,
  DragOverlay,
  UniqueIdentifier
} from '@dnd-kit/core';
import { 
  SortableContext, 
  horizontalListSortingStrategy, 
  verticalListSortingStrategy, 
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import {
  restrictToParentElement,
  restrictToWindowEdges,
  snapCenterToCursor
} from '@dnd-kit/modifiers';
import { motion, AnimatePresence } from 'framer-motion';

// Import interfaces for the Board context
interface Task {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  column: string;
  order: number;
}

interface ColumnType {
  id: string;
  _id?: string;
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
  const [hasCheckedInitialBoard, setHasCheckedInitialBoard] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
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
    // Only check once after initial loading is complete
    if (!isLoading && !hasCheckedInitialBoard) {
      setHasCheckedInitialBoard(true);
      
      // Only show the modal if there's no board and we're not already showing it
      if (!board && user && !boardModalOpen) {
        // Check localStorage to see if we've interacted with a board already
        const hasInteractedWithBoard = localStorage.getItem('kanban_has_board');
        
        // Only show the modal if the user has never interacted with a board
        if (!hasInteractedWithBoard) {
          setBoardModalOpen(true);
        }
      }
    }
  }, [isLoading, board, user, boardModalOpen, hasCheckedInitialBoard]);

  // Handle board creation/update
  const handleBoardSubmit = (title: string) => {
    createBoard(title);
    // Mark that the user has interacted with a board
    localStorage.setItem('kanban_has_board', 'true');
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
      const task = column.tasks.find(t => t.id === taskId || t._id === taskId);
      if (task) {
        setTaskModalData({
          columnId: column.id || column._id || '',
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

  // Log and handle task deletion
  const handleDeleteTask = (taskId: string) => {
    console.log("Deleting task with ID:", taskId);
    if (!taskId) {
      console.error("Task ID is undefined or null");
      return;
    }
    deleteTask(taskId);
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
        column.tasks.some(task => task.id === activeTaskId || task._id === activeTaskId)
      )?.id;
      
      if (sourceColumnId && sourceColumnId !== overColumnId) {
        // Get the highest order in the target column
        const targetColumn = board?.columns.find(column => column.id === overColumnId || column._id === overColumnId);
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
          if (task.id === activeTaskId || task._id === activeTaskId) {
            sourceColumn = column;
            sourceTask = task;
          }
          if (task.id === overTaskId || task._id === overTaskId) {
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
    
    if (!over || !board) return;
    
    const isActiveTask = active.data.current?.type === 'task';
    
    if (isActiveTask) {
      const activeTaskId = active.id as string;
      const isOverTask = over.data.current?.type === 'task';
      const isOverColumn = over.data.current?.type === 'column';
      
      // Find the active task and its column
      let activeTask: Task | undefined;
      let sourceColumn: ColumnType | undefined;
      
      for (const column of board.columns) {
        const task = column.tasks.find(t => t.id === activeTaskId || t._id === activeTaskId);
        if (task) {
          activeTask = task;
          sourceColumn = column;
          break;
        }
      }
      
      if (!activeTask || !sourceColumn) return;
      
      if (isOverTask && active.id !== over.id) {
        // Task dropped over another task (possibly in the same column)
        const overTaskId = over.id as string;
        
        // Find the destination task and its column
        let overTask: Task | undefined;
        let destinationColumn: ColumnType | undefined;
        
        for (const column of board.columns) {
          const task = column.tasks.find(t => t.id === overTaskId || t._id === overTaskId);
          if (task) {
            overTask = task;
            destinationColumn = column;
            break;
          }
        }
        
        if (!overTask || !destinationColumn) return;
        
        // If in same column, update order
        if (sourceColumn.id === destinationColumn.id) {
          console.log(`Reordering task ${activeTaskId} to position ${overTask.order} in column ${sourceColumn.id}`);
          moveTask(activeTaskId, sourceColumn.id, destinationColumn.id, overTask.order);
        } else {
          // If moving to another column
          console.log(`Moving task ${activeTaskId} from column ${sourceColumn.id} to column ${destinationColumn.id} at position ${overTask.order}`);
          moveTask(activeTaskId, sourceColumn.id, destinationColumn.id, overTask.order);
        }
      } else if (isOverColumn) {
        // Task dropped directly on a column
        const overColumnId = over.id as string;
        
        // If the task is dropped on a different column, move it to the end of that column
        if (sourceColumn.id !== overColumnId) {
          const destinationColumn = board.columns.find(c => c.id === overColumnId || c._id === overColumnId);
          if (destinationColumn) {
            const newOrder = destinationColumn.tasks.length;
            console.log(`Moving task ${activeTaskId} to end of column ${overColumnId} at position ${newOrder}`);
            moveTask(activeTaskId, sourceColumn.id, overColumnId, newOrder);
          }
        }
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen gradient-background">
        <NavBar />
        <div className="flex items-center justify-center flex-1">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
            }}
            className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-600"
          ></motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen gradient-background">
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
      
      <main className="flex-1 overflow-x-auto py-8 px-6">
        {board ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always
              },
            }}
            modifiers={[restrictToWindowEdges, snapCenterToCursor]}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex space-x-6 min-h-[calc(100vh-10rem)] pb-10"
            >
              <SortableContext 
                items={board.columns.map(col => col.id)} 
                strategy={horizontalListSortingStrategy}
              >
                <AnimatePresence>
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
                      onDeleteTask={handleDeleteTask}
                    />
                  ))}
                </AnimatePresence>
              </SortableContext>
              
              {/* Add DragOverlay for improved visual feedback */}
              <DragOverlay 
                adjustScale={false} 
                dropAnimation={{
                  duration: 250,
                  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                  sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                      active: {
                        opacity: '0.5',
                      },
                    },
                  }),
                }}
                modifiers={[snapCenterToCursor]}
              >
                {activeTaskId && board.columns.flatMap(col => col.tasks).find(task => (task.id === activeTaskId || task._id === activeTaskId)) && (
                  <div style={{ width: '17rem' }}> {/* Fixed width container for task */}
                    <Task
                      id={activeTaskId}
                      title={board.columns.flatMap(col => col.tasks).find(task => (task.id === activeTaskId || task._id === activeTaskId))?.title || ''}
                      description={board.columns.flatMap(col => col.tasks).find(task => (task.id === activeTaskId || task._id === activeTaskId))?.description || ''}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                )}
                {activeColumnId && board.columns.find(col => (col.id === activeColumnId || col._id === activeColumnId)) && (
                  <div className="opacity-70 w-72 glass card-shadow rounded-xl border-2 border-indigo-400">
                    <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl shadow-sm">
                      <h3 className="text-sm font-medium text-indigo-900">
                        {board.columns.find(col => (col.id === activeColumnId || col._id === activeColumnId))?.title || ''}
                      </h3>
                    </div>
                  </div>
                )}
              </DragOverlay>
              
              {board.columns.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center w-full"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setColumnModalOpen(true)}
                    className="px-6 py-3 text-sm font-medium text-white gradient-primary rounded-lg button-shadow hover:opacity-90 focus:outline-none transition-all duration-200"
                  >
                    Add Your First Column
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </DndContext>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center glass card-shadow p-10 rounded-2xl">
              <motion.h2 
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                className="text-2xl font-bold text-gray-800 mb-6"
              >
                No Board Yet
              </motion.h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBoardModalOpen(true)}
                className="px-6 py-3 text-sm font-medium text-white gradient-primary rounded-lg button-shadow hover:opacity-90 focus:outline-none transition-all duration-200"
              >
                Create a Board
              </motion.button>
              
              {/* Decorative elements */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '50%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-1 mt-8 mx-auto rounded-full bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40"
              />
            </div>
          </motion.div>
        )}
        
        {/* Background decorative elements */}
        <div className="fixed -z-10 inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1.5 }}
            className="absolute top-40 right-20 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-600/10 to-blue-500/10 blur-3xl"
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="absolute bottom-40 left-10 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 blur-3xl"
          />
        </div>
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