'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, MoreVertical, Plus, Trash2 } from 'lucide-react';
import Task from './Task';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface TaskType {
  id: string;
  title: string;
  description?: string;
  column: string;
  order: number;
}

interface ColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onAddTask: (columnId: string) => void;
  onEditColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function Column({
  id,
  title,
  tasks,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onEditTask,
  onDeleteTask
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [showMenu, setShowMenu] = useState(false);

  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging,
    active
  } = useSortable({ 
    id,
    data: {
      type: 'column',
      id,
      title,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() !== '' && newTitle !== title) {
      onEditColumn(id, newTitle);
    } else {
      setNewTitle(title);
    }
    setIsEditing(false);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDeleteColumn(id);
    setShowMenu(false);
  };

  // Sort tasks by order
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
  // Get task IDs for SortableContext
  const taskIds = sortedTasks.map(task => task.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-72 flex-shrink-0 bg-gray-100 rounded-md shadow-sm flex flex-col ${isDragging ? 'ring-2 ring-blue-500' : ''}`}
      data-column-id={id}
    >
      <div className="p-3 bg-white rounded-t-md shadow-sm flex items-center justify-between" {...attributes} {...listeners}>
        {isEditing ? (
          <form onSubmit={handleTitleSubmit} className="w-full">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              onBlur={handleTitleSubmit}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        ) : (
          <h3 className="text-sm font-medium text-gray-800">{title}</h3>
        )}
        
        <div className="relative">
          <button
            onClick={handleMenuToggle}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={handleEdit}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Edit className="h-4 w-4 inline mr-2" />
                  Edit Column
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Trash2 className="h-4 w-4 inline mr-2" />
                  Delete Column
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-12rem)]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {sortedTasks.map((task) => (
            <Task
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              onEdit={() => onEditTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </SortableContext>
      </div>
      
      <div className="p-2 bg-white rounded-b-md">
        <button
          onClick={() => onAddTask(id)}
          className="w-full flex items-center justify-center p-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </button>
      </div>
    </div>
  );
} 