"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  roles?: string[];
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  roles = [],
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Still loading, wait
    }

    if (requireAuth && !isAuthenticated) {
      // User is not authenticated, redirect to login
      router.push("/auth/login");
      return;
    }

    if (!requireAuth && isAuthenticated) {
      // User is authenticated but trying to access auth pages, redirect to dashboard
      router.push("/dashboard");
      return;
    }

    if (
      roles.length > 0 &&
      user &&
      !user.roles?.some((r) => roles.includes(r))
    ) {
      // User doesn't have required role, redirect to dashboard
      router.push("/dashboard");
      return;
    }
  }, [isAuthenticated, isLoading, user, requireAuth, roles, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Don't render children if user is not authenticated and auth is required
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render children if user is authenticated but trying to access auth pages
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // Don't render children if user doesn't have required role
  if (roles.length > 0 && user && !user.roles?.some((r) => roles.includes(r))) {
    return null;
  }

  return <>{children}</>;
}
