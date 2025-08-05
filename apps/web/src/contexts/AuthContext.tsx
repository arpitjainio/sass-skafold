'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authApi } from '@/lib/auth';
import { LoginRequest, RegisterRequest } from '@/lib/auth';
import { setAuthToken, getAuthToken, removeAuthToken } from '@/lib/utils';
import { ApiError } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // TODO: Validate token with backend
      // For now, we'll assume the token is valid
      // In a real app, you'd make an API call to validate the token
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(data);
      
      if (response.success) {
        const { user, token } = response.data;
        setAuthToken(token);
        setUser(user);
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      
      if (response.success) {
        const { user, token } = response.data;
        setAuthToken(token);
        setUser(user);
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Even if logout API fails, we should still clear local state
      console.error('Logout API error:', error);
    } finally {
      removeAuthToken();
      setUser(null);
      router.push('/auth/login');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.forgotPassword(email);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.resetPassword(token, password);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 