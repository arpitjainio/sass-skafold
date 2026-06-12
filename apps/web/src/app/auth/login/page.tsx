"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  const handleLogin = async (data: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error("Login error:", error);
      // Error handling will be done in the AuthContext
    }
  };

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} />;
}
