"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@repo/ui";
import { useAuthMetadata } from "./config";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const metadata = useAuthMetadata(pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content area */}
      <main className="flex flex-1">
        {/* Left side - Gradient background with branding */}
        <aside className="lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

          {/* Floating elements for visual interest */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full blur-lg" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold mb-4">
                Welcome to Admin Dashboard
              </h1>
              <p className="text-lg text-white/80 leading-relaxed">
                Manage your business with powerful tools and insights. Secure,
                scalable, and designed for modern teams.
              </p>

              {/* Feature highlights */}
              <ul className="mt-8 space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                  <span className="text-white/80">Secure authentication</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                  <span className="text-white/80">Real-time analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                  <span className="text-white/80">Team collaboration</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Right side - Auth form */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {/* Logo/Brand */}
            <header className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {metadata.title}
              </h2>
              {metadata.subtitle && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {metadata.subtitle}
                </p>
              )}
            </header>

            {/* Auth card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">{children}</CardContent>
            </Card>
          </div>
          {/* Footer */}
          <footer className="py-4 text-center border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 Admin Dashboard. All rights reserved.
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}
