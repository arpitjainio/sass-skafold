'use client';

import React, { useState } from 'react';
import {LoginForm} from '../components/LoginForm';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual login logic
      console.log('Login attempt:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Redirect to dashboard on success
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return <LoginForm onSubmit={handleSubmit} />;
} 