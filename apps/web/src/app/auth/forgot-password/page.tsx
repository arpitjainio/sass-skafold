'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuth();

  const handleForgotPassword = async (email: string) => {
    try {
      await forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      // Error handling will be done in the AuthContext
    }
  };

  return (
    <ForgotPasswordForm 
      onSubmit={handleForgotPassword}
      isLoading={isLoading}
    />
  );
} 