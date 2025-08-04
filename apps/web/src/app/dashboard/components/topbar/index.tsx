import { Menu, Sun, Moon, Bell, User } from "lucide-react";
import { TopbarProps } from "@/shared/types";

export function Topbar({ sidebarOpen, setSidebarOpen, toggleTheme, theme }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-primary-50 dark:bg-primary-900 shadow-sm border-b border-gray-300 dark:border-gray-600">
    <div className="w-full flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-black dark:text-white hover:text-primary-50 hover:bg-primary-100 dark:hover:bg-primary-950"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-semibold text-black dark:text-white lg:hidden">
          Admin Panel
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-md text-black dark:text-white hover:text-primary-50 hover:bg-primary-100 dark:hover:bg-primary-900"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Sun className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
        
        <button 
          className="p-2 rounded-md text-black dark:text-white hover:text-primary-50 hover:bg-primary-100 dark:hover:bg-primary-900 relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
        </button>
        
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary-950" aria-hidden="true" />
        </div>
      </div>
    </div>
  </header>
  );
}