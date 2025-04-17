'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import NavBar from '@/components/NavBar';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect to board if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/board');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
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
    <div className="flex flex-col min-h-screen gradient-background overflow-hidden relative">
      <NavBar />
      
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:text-center"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-base text-indigo-600 font-semibold tracking-wide uppercase"
            >
              Kanban Board
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl"
            >
              Organize Your Tasks with Ease
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto"
            >
              A simple and effective way to manage your projects using the Kanban methodology.
              Create boards, add tasks, and track your progress in real-time.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-12 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/signup"
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-lg gradient-primary text-white button-shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                >
                  Get Started
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/login"
                  className="px-8 py-3 glass text-base font-medium rounded-lg text-gray-700 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                >
                  Sign In
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-24"
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <motion.div 
                whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="glass card-shadow rounded-xl overflow-hidden"
              >
                <div className="px-6 py-8">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Drag and Drop</h3>
                  <p className="mt-2 text-gray-600">
                    Easily move tasks between columns with intuitive drag and drop functionality.
                  </p>
                </div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }}
                  transition={{ duration: 1, delay: 1 }}
                  className="h-1 bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40"
                />
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="glass card-shadow rounded-xl overflow-hidden"
                transition={{ delay: 0.1 }}
              >
                <div className="px-6 py-8">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Real-time Updates</h3>
                  <p className="mt-2 text-gray-600">
                    See changes instantly with real-time updates powered by WebSockets.
                  </p>
                </div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }}
                  transition={{ duration: 1, delay: 1.2 }}
                  className="h-1 bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-indigo-500/40"
                />
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="glass card-shadow rounded-xl overflow-hidden"
                transition={{ delay: 0.2 }}
              >
                <div className="px-6 py-8">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Secure Authentication</h3>
                  <p className="mt-2 text-gray-600">
                    Your data is protected with secure JWT-based authentication.
                  </p>
                </div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }}
                  transition={{ duration: 1, delay: 1.4 }}
                  className="h-1 bg-gradient-to-r from-teal-500/40 via-indigo-500/40 to-purple-500/40"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <footer className="glass border-t border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center text-gray-600 text-sm"
          >
            © {new Date().getFullYear()} Kanban Board Application. All rights reserved.
          </motion.p>
        </div>
      </footer>

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
          className="absolute bottom-40 left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="absolute top-60 left-40 w-72 h-72 rounded-full bg-gradient-to-tr from-teal-400/10 to-indigo-600/10 blur-3xl"
        />
      </div>
    </div>
  );
}
