'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  title?: string;
  isEditing?: boolean;
}

export default function ColumnModal({
  isOpen,
  onClose,
  onSubmit,
  title = '',
  isEditing = false,
}: ColumnModalProps) {
  const [columnTitle, setColumnTitle] = useState(title);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setColumnTitle(title);
    }
  }, [isOpen, title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnTitle.trim() === '') return;
    onSubmit(columnTitle);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg sm:align-middle relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {isEditing ? 'Edit Column' : 'Add New Column'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="column-title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="column-title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Column title"
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md border border-gray-300"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
              >
                {isEditing ? 'Save Changes' : 'Add Column'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 