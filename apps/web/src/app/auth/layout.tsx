"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getAuthMetadata } from "./config";
import { Card } from "@repo/ui";
import { CardContent } from "@repo/ui";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const metadata = getAuthMetadata(pathname);
  const currentYear = new Date().getFullYear();

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex">
        {/* Left side - Branding */}
        <aside className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col justify-center px-12 py-16">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold text-white">
                SaaS Skafold
              </span>
            </div>

            <div className="max-w-md">
              <h1 className="text-4xl font-bold text-white mb-4">
                {metadata.title}
              </h1>
              {metadata.subtitle && (
                <p className="text-lg text-primary-100 leading-relaxed">
                  {metadata.subtitle}
                </p>
              )}
            </div>

            {/* Feature list */}
            <ul className="mt-12 space-y-4">
              <li className="flex items-center text-primary-100">
                <div
                  className="w-2 h-2 bg-primary-200 rounded-full mr-3"
                  aria-hidden="true"
                />
                <span>Secure authentication with JWT tokens</span>
              </li>
              <li className="flex items-center text-primary-100">
                <div
                  className="w-2 h-2 bg-primary-200 rounded-full mr-3"
                  aria-hidden="true"
                />
                <span>Role-based access control</span>
              </li>
              <li className="flex items-center text-primary-100">
                <div
                  className="w-2 h-2 bg-primary-200 rounded-full mr-3"
                  aria-hidden="true"
                />
                <span>Real-time dashboard analytics</span>
              </li>
              <li className="flex items-center text-primary-100">
                <div
                  className="w-2 h-2 bg-primary-200 rounded-full mr-3"
                  aria-hidden="true"
                />
                <span>Comprehensive user management</span>
              </li>
            </ul>
          </div>

          {/* Decorative elements */}
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"
            aria-hidden="true"
          />
        </aside>

        {/* Right side - Form */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Auth card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm w-full max-w-lg">
            <CardContent className="p-8">{children}</CardContent>
          </Card>
          {/* Footer */}
          <footer className="py-4 text-center border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © {currentYear} Admin Dashboard. All rights reserved.
            </p>
          </footer>
        </main>
      </div>
    </ProtectedRoute>
  );
}
