'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { LogOut, Plus } from 'lucide-react';

interface NavBarProps {
  onAddColumn?: () => void;
  onBoardTitleClick?: () => void;
  boardTitle?: string;
  showBoardOptions?: boolean;
}

export default function NavBar({ 
  onAddColumn, 
  onBoardTitleClick, 
  boardTitle = 'Kanban Board',
  showBoardOptions = false 
}: NavBarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 font-bold text-xl">Kanban</span>
            </Link>
            
            {showBoardOptions && boardTitle && (
              <div className="ml-6 flex items-center">
                <button 
                  onClick={onBoardTitleClick}
                  className="text-gray-800 font-medium hover:text-blue-600 focus:outline-none"
                >
                  {boardTitle}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {showBoardOptions && onAddColumn && (
              <button
                onClick={onAddColumn}
                className="inline-flex items-center px-3 py-1 mr-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:ring-blue active:bg-blue-700 transition ease-in-out duration-150"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Column
              </button>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.name}</span>
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-1" /> 
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link 
                  href="/signup"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:ring-blue active:bg-blue-700 transition ease-in-out duration-150"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 