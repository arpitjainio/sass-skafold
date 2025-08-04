'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@repo/utils/cn';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Settings, 
  Home,
  User,
} from 'lucide-react';
import { Sidebar } from './components/sidebar';
import { Topbar } from './components/topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, isActive: true },
  { name: 'Users', href: '/dashboard/users', icon: Users, isActive: true },
  { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCard, isActive: true },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, isActive: true },
  { name: 'Profile', href: '/dashboard/profile', icon: User, isActive: true },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, isActive: false },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const pathname = usePathname();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigation={navigation}
        pathname={pathname}
      />

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-64" : "lg:ml-0"
      )}>
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          toggleTheme={toggleTheme}
          theme={theme}
        />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-primary-50 dark:bg-primary-900">
          {children}
        </main>
      </div>
    </div>
  );
} 