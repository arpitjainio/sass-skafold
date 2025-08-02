'use client';

import React, { useState } from 'react';
import { ResetPasswordForm } from '../components/ResetPasswordForm';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { password: string; confirmPassword: string }) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual password reset logic
      console.log('Password reset with new password:', data.password);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Password reset error:', error);
      throw error; // Re-throw to let the form handle the error
    } finally {
      setIsLoading(false);
    }
  };

  return <ResetPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />;
} 