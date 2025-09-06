import { apiClient, ApiResponse } from "./api";

// Analytics API types
export interface DashboardAnalytics {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  userGrowth: number;
  subscriptionStats: Record<string, number>;
}

export interface RevenueAnalytics {
  month: string;
  count: number;
}

export interface UserGrowthAnalytics {
  month: string;
  count: number;
  cumulative: number;
}

export const analyticsApi = {
  // Get dashboard overview analytics (for regular users - shows user-specific data)
  getDashboardAnalytics: () =>
    apiClient.get<ApiResponse<DashboardAnalytics>>("/users/analytics/dashboard"),

  // Get revenue analytics (admin only)
  getRevenueAnalytics: () =>
    apiClient.get<ApiResponse<RevenueAnalytics[]>>("/admin/analytics/revenue"),

  // Get user growth analytics (admin only)
  getUserGrowthAnalytics: () =>
    apiClient.get<ApiResponse<UserGrowthAnalytics[]>>("/admin/analytics/user-growth"),

  // Admin analytics endpoints
  getAdminDashboardAnalytics: () =>
    apiClient.get<ApiResponse<DashboardAnalytics>>("/admin/analytics/dashboard"),
};
