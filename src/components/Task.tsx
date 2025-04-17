'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 },
    hover: { y: -4, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)' }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      transition={{ 
        duration: 0.2,
        type: 'spring', 
        stiffness: 500, 
        damping: 30 
      }}
      className={`glass p-4 mb-3 rounded-xl card-shadow cursor-pointer ${
        isDragging ? 'ring-2 ring-indigo-500 bg-indigo-50/30' : ''
      }`}
      {...attributes}
      {...listeners}
      data-task-id={taskId}
    >
      <div className="flex items-start justify-between">
        <div className="w-full overflow-hidden">
          <h4 className="text-sm font-medium text-gray-900 mb-2 truncate">{title}</h4>
          {description && (
            <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
          )}
        </div>
        
        <div className="relative ml-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleMenuToggle}
            className="p-1.5 rounded-full bg-gray-100/60 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100/60 focus:outline-none transition-colors"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </motion.button>
          
          {showMenu && (
            <motion.div 
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-1 w-36 rounded-lg shadow-lg glass card-shadow ring-1 ring-black/5 z-20 overflow-hidden"
            >
              <div className="py-1" role="menu" aria-orientation="vertical">
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                  onClick={handleEdit}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700"
                  role="menuitem"
                >
                  <Edit className="h-4 w-4 inline mr-2 text-indigo-500" />
                  Edit Task
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                  onClick={handleDelete}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600"
                  role="menuitem"
                >
                  <Trash2 className="h-4 w-4 inline mr-2" />
                  Delete Task
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Optional visual indicator for tasks */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '30%' }}
        transition={{ duration: 1, delay: 0.2 }}
        className="h-1 mt-3 rounded-full bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40"
      />
    </motion.div>
  );
} 