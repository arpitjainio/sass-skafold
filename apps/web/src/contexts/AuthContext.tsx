'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth';
import { LoginRequest, RegisterRequest } from '@/lib/auth';
import { setAuthToken, getAuthToken, removeAuthToken } from '@/lib/utils';
import { ApiError } from '@/lib/api';
import { useNotifications } from '@/components/Notification';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
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

function normalizeAuthUser(authUser: {
  id: string;
  name: string | null;
  email: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}): User {
  const timestamp = new Date().toISOString();

  return {
    id: authUser.id,
    name: authUser.name ?? 'User',
    email: authUser.email,
    roles: authUser.roles ?? [],
    createdAt: authUser.createdAt ?? timestamp,
    updatedAt: authUser.updatedAt ?? timestamp,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { addNotification } = useNotifications();

  // Check if user is authenticated on mount and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const response = await authApi.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          } else {
            // Invalid token, remove it
            removeAuthToken();
          }
        } catch (error) {
          // Token validation failed, remove it
          removeAuthToken();
          console.error('Token validation failed:', error);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(data);
      
      if (response.success) {
        const { user: authUser, accessToken } = response.data;
        setAuthToken(accessToken);

        const user = normalizeAuthUser(authUser);
        
        setUser(user);
        addNotification({
          type: 'success',
          title: 'Login successful',
          message: `Welcome back, ${user.name}!`,
        });
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        addNotification({
          type: 'error',
          title: 'Login failed',
          message: error.message,
        });
        throw new Error(error.message);
      }
      addNotification({
        type: 'error',
        title: 'Login failed',
        message: 'Please check your credentials and try again.',
      });
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
        const { user: authUser, accessToken } = response.data;
        setAuthToken(accessToken);

        const user = normalizeAuthUser(authUser);
        
        setUser(user);
        addNotification({
          type: 'success',
          title: 'Registration successful',
          message: `Welcome to SaaS Skafold, ${user.name}!`,
        });
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        addNotification({
          type: 'error',
          title: 'Registration failed',
          message: error.message,
        });
        throw new Error(error.message);
      }
      addNotification({
        type: 'error',
        title: 'Registration failed',
        message: 'Please check your information and try again.',
      });
      throw new Error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      addNotification({
        type: 'success',
        title: 'Logged out successfully',
        message: 'You have been logged out of your account.',
      });
    } catch (error) {
      // Even if logout API fails, we should still clear local state
      console.error('Logout API error:', error);
      addNotification({
        type: 'warning',
        title: 'Logout warning',
        message: 'You have been logged out, but there was an issue with the server.',
      });
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
      
      addNotification({
        type: 'success',
        title: 'Reset email sent',
        message: 'Please check your email for password reset instructions.',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const message =
          error.status === 404
            ? 'Password reset endpoints are not implemented in this starter yet.'
            : error.message;

        addNotification({
          type: 'error',
          title: 'Failed to send reset email',
          message,
        });
        throw new Error(message);
      }
      addNotification({
        type: 'error',
        title: 'Failed to send reset email',
        message: 'Please check your email address and try again.',
      });
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
      
      addNotification({
        type: 'success',
        title: 'Password reset successful',
        message: 'Your password has been updated successfully.',
      });
      
      // Redirect to login page after successful password reset
      router.push('/auth/login');
    } catch (error) {
      if (error instanceof ApiError) {
        const message =
          error.status === 404
            ? 'Password reset endpoints are not implemented in this starter yet.'
            : error.message;

        addNotification({
          type: 'error',
          title: 'Failed to reset password',
          message,
        });
        throw new Error(message);
      }
      addNotification({
        type: 'error',
        title: 'Failed to reset password',
        message: 'Please check your reset token and try again.',
      });
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
