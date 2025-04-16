'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to store user in localStorage
  const storeUser = (userData: User | null) => {
    if (userData) {
      localStorage.setItem('kanban_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('kanban_user');
    }
  };

  // Set user state and store in localStorage
  const setUserData = (userData: User | null) => {
    setUser(userData);
    storeUser(userData);
  };

  // Check if user is logged in
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // First check localStorage for existing user data
        const storedUser = localStorage.getItem('kanban_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Validate the stored user against the API
          const response = await fetch('/api/auth/me');
          const data = await response.json();

          if (data.success && data.data.user) {
            // Update with fresh data from the server
            setUserData(data.data.user);
          } else {
            // Clear invalid stored user
            setUserData(null);
          }
        } else {
          // If no stored user, try to fetch from API
          const response = await fetch('/api/auth/me');
          const data = await response.json();

          if (data.success && data.data.user) {
            setUserData(data.data.user);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // If API call fails but we have local data, keep it
        // This helps when API is temporarily unavailable
      } finally {
        setIsLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.data.user);
        toast.success('Logged in successfully');
        router.push('/board');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.data.user);
        toast.success('Account created successfully');
        router.push('/board');
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUserData(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 