import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
}

export interface DashboardUserSummary {
  name: string;
  email: string;
  roles?: string[];
}

export interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navigation: NavigationItem[];
  pathname: string;
  onLogout: () => void;
  currentUser?: DashboardUserSummary | null;
}

export interface TopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  theme: string;
  currentUser?: DashboardUserSummary | null;
}
