'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Input } from '@repo/ui';
import { LoadingSpinner } from './LoadingSpinner';
import { StatusMessage } from './StatusMessage';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface ResetPasswordFormProps {
  onSubmit?: (data: { password: string; confirmPassword: string; token: string }) => Promise<void>;
  isLoading?: boolean;
}

export function ResetPasswordForm({ onSubmit, isLoading = false }: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    // TODO: Validate token with API
    if (token) {
      // Simulate token validation
      setTimeout(() => {
        setIsTokenValid(true);
      }, 500);
    } else {
      setIsTokenValid(false);
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (onSubmit && token) {
      await onSubmit({ ...formData, token });
      setIsSuccess(true);
    }
  };

  // Loading state
  if (isTokenValid === null) {
    return <LoadingSpinner size="lg" text="Verifying your reset link..." />;
  }

  // Invalid token
  if (isTokenValid === false) {
    return (
      <StatusMessage
        type="error"
        title="Link expired or invalid"
        message="This password reset link has expired or is invalid. Please request a new password reset link."
        actions={[
          {
            label: 'Request new reset link',
            href: '/auth/forgot-password'
          },
          {
            label: 'Back to sign in',
            href: '/auth/login',
            variant: 'outline'
          }
        ]}
      />
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <StatusMessage
        type="success"
        title="Password updated!"
        message="Your password has been successfully reset. You can now sign in with your new password."
        actions={[
          {
            label: 'Sign in with new password',
            href: '/auth/login'
          }
        ]}
      />
    );
  }

  // Reset password form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Password field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          New password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your new password"
          value={formData.password}
          onChange={handleInputChange}
          {...(errors.password && { error: errors.password })}
          size="lg"
          autoComplete="new-password"
          required
        />
        <PasswordStrengthIndicator password={formData.password} />
      </div>

      {/* Confirm Password field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Confirm new password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your new password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          {...(errors.confirmPassword && { error: errors.confirmPassword })}
          size="lg"
          autoComplete="new-password"
          required
        />
      </div>

      {/* General error */}
      {errors.general && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                {errors.general}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Updating password...</span>
          </div>
        ) : (
          'Update password'
        )}
      </Button>

      {/* Back to login */}
      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          ← Back to sign in
        </Link>
      </div>
    </form>
  );
} 