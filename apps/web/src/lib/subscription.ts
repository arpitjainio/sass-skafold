import { apiClient, ApiResponse, PaginatedResponse } from "./api";
import { User } from "./user";

// Subscription API
export interface Subscription {
  id: number;
  userId: number;
  user: User;
  plan: string;
  status: "active" | "cancelled" | "past_due" | "suspended";
  amount: number;
  currency: string;
  nextBilling: string;
  startDate: string;
  endDate?: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  userId: number;
  plan: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface UpdateSubscriptionRequest {
  plan?: string;
  status?: string;
  amount?: number;
  nextBilling?: string;
}

export const subscriptionApi = {
  getSubscriptions: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    plan?: string;
    status?: string;
  }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Subscription>>>(
      "/subscriptions" +
        (params ? `?${new URLSearchParams(params as any)}` : "")
    ),

  getSubscription: (id: number) =>
    apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`),

  createSubscription: (data: CreateSubscriptionRequest) =>
    apiClient.post<ApiResponse<Subscription>>("/subscriptions", data),

  updateSubscription: (id: number, data: UpdateSubscriptionRequest) =>
    apiClient.put<ApiResponse<Subscription>>(`/subscriptions/${id}`, data),

  cancelSubscription: (id: number) =>
    apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/cancel`),

  reactivateSubscription: (id: number) =>
    apiClient.post<ApiResponse<Subscription>>(
      `/subscriptions/${id}/reactivate`
    ),
};
