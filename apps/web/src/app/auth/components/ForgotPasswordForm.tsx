'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@repo/ui';
import { StatusMessage } from './StatusMessage';

interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => Promise<void>;
  isLoading?: boolean;
}

export function ForgotPasswordForm({ onSubmit, isLoading = false }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;

    if (onSubmit) {
      await onSubmit(email);
      setIsSubmitted(true);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setEmail('');
    setError('');
  };

  if (isSubmitted) {
    return (
      <StatusMessage
        type="success"
        title="Reset link sent!"
        message={`We've sent a password reset link to ${email}`}
        actions={[
          {
            label: '← Back to sign in',
            href: '/auth/login'
          }
        ]}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleInputChange}
          {...(error && { error })}
          size="lg"
          autoComplete="email"
          required
        />
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
              How it works
            </h3>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Enter your email address and we'll send you a link to reset your password.
                The link will expire in 1 hour for security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        variant='default'
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Sending reset link...</span>
          </div>
        ) : (
          'Send reset link'
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