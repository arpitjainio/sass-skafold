'use client';

import React, { useState } from 'react';
import { Button, Input, Checkbox } from '@repo/ui';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { SocialLoginButtons } from './SocialLoginButtons';

interface RegisterFormProps {
  onSubmit?: (data: { 
    name: string; 
    email: string; 
    password: string; 
    confirmPassword: string;
    agreeToTerms: boolean;
  }) => void;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

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

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit?.(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreeToTerms: checked }));
    
    // Clear error when user checks the box
    if (errors.agreeToTerms) {
      setErrors(prev => ({ ...prev, agreeToTerms: '' }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            {...(errors.name && { error: errors.name })}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-danger" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            {...(errors.email && { error: errors.email })}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-danger" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a password"
            {...(errors.password && { error: errors.password })}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {formData.password && (
            <PasswordStrengthIndicator password={formData.password} />
          )}
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-danger" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            {...(errors.confirmPassword && { error: errors.confirmPassword })}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="mt-1 text-sm text-danger" role="alert">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="agree-terms"
            checked={formData.agreeToTerms}
            onCheckedChange={handleCheckboxChange}
          />
          <div className="flex-1">
            <label htmlFor="agree-terms" className="text-sm text-gray-600 dark:text-gray-400">
              I agree to the{' '}
              <a 
                href="/terms" 
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a 
                href="/privacy" 
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Privacy Policy
              </a>
            </label>
            {errors.agreeToTerms && (
              <p className="mt-1 text-sm text-danger" role="alert">
                {errors.agreeToTerms}
              </p>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          loading={isLoading ?? false}
          disabled={isLoading ?? false}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>

        <SocialLoginButtons />

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a 
            href="/auth/login" 
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
} 