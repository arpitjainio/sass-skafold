'use client';

import React, { useState } from 'react';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual password reset logic
      console.log('Password reset request for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Password reset error:', error);
      throw error; // Re-throw to let the form handle the error
    } finally {
      setIsLoading(false);
    }
  };

  return <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />;
} 