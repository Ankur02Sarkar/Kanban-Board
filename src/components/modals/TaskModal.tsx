'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
  title?: string;
  description?: string;
  isEditing?: boolean;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  title = '',
  description = '',
  isEditing = false,
}: TaskModalProps) {
  const [taskTitle, setTaskTitle] = useState(title);
  const [taskDescription, setTaskDescription] = useState(description);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTaskTitle(title);
      setTaskDescription(description);
    }
  }, [isOpen, title, description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim() === '') return;
    onSubmit(taskTitle, taskDescription);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
          >
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity" 
              onClick={onClose}
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
            </motion.div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 30 }}
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle glass card-shadow rounded-xl sm:align-middle relative z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <motion.h3 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg font-semibold leading-6 text-gray-900"
                >
                  {isEditing ? 'Edit Task' : 'Add New Task'}
                </motion.h3>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 focus:outline-none transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit}>
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-5"
                >
                  <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    id="task-title"
                    className="w-full px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter task title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                  />
                </motion.div>

                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description (optional)
                  </label>
                  <textarea
                    id="task-description"
                    className="w-full px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Add details about this task"
                    rows={3}
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  ></textarea>
                </motion.div>

                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-end"
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="mr-3 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white/60 hover:bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg border border-gray-200"
                    onClick={onClose}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-4 py-2.5 text-sm font-medium text-white gradient-primary rounded-lg button-shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity"
                  >
                    {isEditing ? 'Save Changes' : 'Add Task'}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 