"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ResetPasswordForm } from "../components/ResetPasswordForm";

export default function ResetPasswordPage() {
  const { resetPassword, isLoading } = useAuth();

  const handleResetPassword = async (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await resetPassword(data.token, data.password);
    } catch (error) {
      console.error("Reset password error:", error);
      // Error handling will be done in the AuthContext
    }
  };

  return (
    <ResetPasswordForm onSubmit={handleResetPassword} isLoading={isLoading} />
  );
}
