"use client";

import React, { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit, MoreVertical, Plus, Trash2 } from "lucide-react";
import Task from "./Task";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";

interface TaskType {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  column: string;
  order: number;
}

interface ColumnProps {
  id: string;
  _id?: string;
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
  onDeleteTask,
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [showMenu, setShowMenu] = useState(false);

  const columnId = id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    active,
  } = useSortable({
    id: columnId,
    data: {
      type: "column",
      id: columnId,
      title,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : "auto",
    touchAction: "none",
    width: '18rem',
    transformOrigin: '0 0',
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() !== "" && newTitle !== title) {
      onEditColumn(columnId, newTitle);
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
    onDeleteColumn(columnId);
    setShowMenu(false);
  };

  // Sort tasks by order
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
  // Get task IDs for SortableContext
  const taskIds = sortedTasks.map((task) => task._id || task.id);

  useEffect(() => {
    console.log("sortedTasks : ", sortedTasks);
  }, [sortedTasks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      ref={setNodeRef}
      style={style}
      className={`glass card-shadow rounded-xl flex flex-col ${
        isDragging ? "ring-2 ring-indigo-500 opacity-70" : ""
      }`}
      data-column-id={columnId}
    >
      <div
        className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100/30 rounded-t-xl flex items-center justify-between"
        {...attributes}
        {...listeners}
      >
        {isEditing ? (
          <form onSubmit={handleTitleSubmit} className="w-full">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              onBlur={handleTitleSubmit}
              className="w-full px-3 py-1.5 border border-indigo-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm"
            />
          </form>
        ) : (
          <motion.h3 
            layoutId={`column-title-${columnId}`}
            className="text-sm font-semibold text-indigo-900"
          >
            {title}
          </motion.h3>
        )}

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleMenuToggle}
            className="p-1.5 rounded-full text-indigo-500 hover:text-indigo-700 hover:bg-white/50 backdrop-blur-sm focus:outline-none transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-1 w-40 rounded-lg overflow-hidden shadow-lg glass card-shadow z-10"
              >
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                    onClick={handleEdit}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                  >
                    <Edit className="h-4 w-4 inline mr-2 text-indigo-500" />
                    Edit Column
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                    onClick={handleDelete}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600"
                    role="menuitem"
                  >
                    <Trash2 className="h-4 w-4 inline mr-2" />
                    Delete Column
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto max-h-[calc(100vh-12rem)] scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
        <AnimatePresence>
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {sortedTasks.map((task) => (
              <Task
                key={task._id || task.id}
                id={task._id || task.id}
                title={task.title}
                description={task.description}
                onEdit={() => onEditTask(task._id || task.id)}
                onDelete={() => onDeleteTask(task._id || task.id)}
              />
            ))}
          </SortableContext>
        </AnimatePresence>
        
        {sortedTasks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
            className="text-center py-5 text-sm text-gray-500"
          >
            No tasks yet
          </motion.div>
        )}
      </div>

      <motion.div 
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        className="p-3 rounded-b-xl border-t border-indigo-100/30"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onAddTask(columnId)}
          className="w-full flex items-center justify-center p-2 text-sm text-indigo-600 hover:text-indigo-700 bg-white/40 hover:bg-white/60 backdrop-blur-sm rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
