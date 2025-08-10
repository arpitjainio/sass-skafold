import Link from "next/link";
import { LogOut, X, User } from "lucide-react";
import { SidebarProps } from "@/shared/types";
import { cn } from "@repo/utils/cn";
import { Button } from "@repo/ui";

export function Sidebar({ sidebarOpen, setSidebarOpen, navigation, pathname, onLogout }: SidebarProps) {
  return (
    <aside className={cn(
    "fixed inset-y-0 left-0 z-50 w-64 bg-primary-50 dark:bg-primary-950 shadow-lg transition-transform duration-300 ease-in-out",
    sidebarOpen ? "translate-x-0" : "-translate-x-full"
  )}>
    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-300 dark:border-gray-700 dark:border-gray-600 shadow-sm">
      <div className="flex items-center">
        <span className="ml-3 text-lg font-semibold text-background dark:text-primary-100 font-heading">
          Admin Panel
        </span>
      </div>
      <button
        onClick={() => setSidebarOpen(false)}
        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Close sidebar"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    <nav className="mt-8 px-4" aria-label="Main navigation">
      <div className="space-y-1">
        {navigation.filter(item => item.isActive).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                  : "text-gray-700 hover:bg-primary-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive
                    ? "text-primary-500"
                    : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>

    {/* User section at bottom */}
    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-300 dark:border-gray-700 dark:border-gray-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Admin User
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              admin@example.com
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Sign out"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  </aside>
  );
}