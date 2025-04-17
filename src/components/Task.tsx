'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';

interface TaskProps {
  id: string;
  title: string;
  description?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function Task({ id, title, description, onEdit, onDelete }: TaskProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Use MongoDB _id or fallback to id
  const taskId = id;

  // Debug log when component mounts
  useEffect(() => {
    console.log("Task component mounted with ID:", taskId);
    return () => console.log("Task component unmounted with ID:", taskId);
  }, [taskId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging,
    active
  } = useSortable({ 
    id: taskId,
    data: {
      type: 'task',
      id: taskId,
      title,
      description
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    position: 'relative' as const,
    touchAction: 'none',
    width: 'calc(100% - 4px)',
    transformOrigin: '0 0',
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Editing task with ID:", taskId);
    onEdit();
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Deleting task with ID:", taskId);
    // Make sure we don't call onDelete with undefined
    if (taskId) {
      onDelete();
    } else {
      console.error("Cannot delete task with undefined ID");
    }
    setShowMenu(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-3 mb-2 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 ${isDragging ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
      {...attributes}
      {...listeners}
      data-task-id={taskId}
    >
      <div className="flex items-start justify-between">
        <div className="w-full overflow-hidden">
          <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">{title}</h4>
          {description && (
            <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
          )}
        </div>
        
        <div className="relative ml-2 flex-shrink-0">
          <button
            onClick={handleMenuToggle}
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <div 
              ref={menuRef}
              className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
            >
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={handleEdit}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Edit className="h-4 w-4 inline mr-2" />
                  Edit Task
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Trash2 className="h-4 w-4 inline mr-2" />
                  Delete Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 