import { apiClient, ApiResponse } from "./api";

// Analytics API
export interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
  users: {
    total: number;
    active: number;
    growth: number;
  };
  subscriptions: {
    total: number;
    active: number;
    cancelled: number;
  };
  charts: {
    revenue: Array<{ month: string; amount: number }>;
    users: Array<{ month: string; count: number }>;
    subscriptions: Array<{ month: string; count: number }>;
  };
}

export const analyticsApi = {
  getDashboardData: () =>
    apiClient.get<ApiResponse<AnalyticsData>>("/analytics/dashboard"),

  getRevenueData: (period: string) =>
    apiClient.get<ApiResponse<AnalyticsData["charts"]["revenue"]>>(
      `/analytics/revenue?period=${period}`
    ),

  getUserGrowthData: (period: string) =>
    apiClient.get<ApiResponse<AnalyticsData["charts"]["users"]>>(
      `/analytics/users?period=${period}`
    ),

  getSubscriptionData: (period: string) =>
    apiClient.get<ApiResponse<AnalyticsData["charts"]["subscriptions"]>>(
      `/analytics/subscriptions?period=${period}`
    ),
};
