'use client';

import React, { useState } from 'react';
import { RegisterForm } from '../components/RegisterForm';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  }) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual registration logic
      console.log('Registration attempt:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Redirect to dashboard or email verification page
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />;
} 