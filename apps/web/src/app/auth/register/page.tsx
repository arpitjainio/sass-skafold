'use client';

import { useAuth } from '@/contexts/AuthContext';
import { RegisterForm } from '../components/RegisterForm';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();

  const handleRegister = async (data: { 
    name: string; 
    email: string; 
    password: string; 
    confirmPassword: string;
    agreeToTerms: boolean;
  }) => {
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error('Registration error:', error);
      // Error handling will be done in the AuthContext
    }
  };

  return (
    <RegisterForm 
      onSubmit={handleRegister}
      isLoading={isLoading}
    />
  );
} 