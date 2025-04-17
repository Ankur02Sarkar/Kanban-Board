'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { LogOut, Plus, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass sticky top-0 z-10 backdrop-blur-md border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <motion.span 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 10
                }}
                className="gradient-primary bg-clip-text text-transparent font-bold text-xl"
              >
                Kanban
              </motion.span>
            </Link>
            
            {showBoardOptions && boardTitle && (
              <div className="ml-6 flex items-center">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBoardTitleClick}
                  className="text-gray-800 font-medium hover:text-indigo-600 focus:outline-none transition-colors"
                >
                  {boardTitle}
                </motion.button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          
          <div className="hidden sm:flex items-center">
            {showBoardOptions && onAddColumn && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddColumn}
                className="inline-flex items-center px-4 py-2 mr-4 text-sm font-medium gradient-success text-white rounded-lg button-shadow hover:opacity-90 focus:outline-none transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Column
              </motion.button>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800"
                >
                  <span className="text-sm font-medium">{user.name}</span>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => logout()}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" /> 
                  Logout
                </motion.button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link 
                    href="/signup"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium gradient-primary text-white rounded-lg button-shadow hover:opacity-90 focus:outline-none transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="sm:hidden glass-dark"
        >
          <div className="px-2 pt-2 pb-3 space-y-2">
            {showBoardOptions && onAddColumn && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onAddColumn();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center px-3 py-2 text-sm font-medium gradient-success text-white rounded-md button-shadow hover:opacity-90 focus:outline-none transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Column
              </motion.button>
            )}
            
            {user ? (
              <>
                <div className="px-3 py-2 rounded-md bg-indigo-100/20 text-indigo-100">
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" /> 
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
} 