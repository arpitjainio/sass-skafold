import { apiClient, ApiResponse } from "./api";

// Subscription API types
export interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateSubscriptionRequest {
  priceId: string;
  customerId: string;
  paymentMethodId: string;
}

export interface UpdateSubscriptionRequest {
  priceId: string;
}

export interface CancelSubscriptionRequest {
  cancelAtPeriodEnd: boolean;
}

export interface BillingPortalRequest {
  returnUrl: string;
}

export interface PaginatedSubscriptionsResponse {
  data: Subscription[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const subscriptionApi = {
  // Get user subscriptions
  getUserSubscriptions: () =>
    apiClient.get<ApiResponse<Subscription[]>>("/subscriptions"),

  // Create new subscription
  createSubscription: (data: CreateSubscriptionRequest) =>
    apiClient.post<ApiResponse<Subscription>, CreateSubscriptionRequest>("/subscriptions", data),

  // Update subscription
  updateSubscription: (id: string, data: UpdateSubscriptionRequest) =>
    apiClient.put<ApiResponse<Subscription>, UpdateSubscriptionRequest>(`/subscriptions/${id}`, data),

  // Cancel subscription
  cancelSubscription: (id: string, data: CancelSubscriptionRequest) =>
    apiClient.post<ApiResponse<{ message: string }>, CancelSubscriptionRequest>(`/subscriptions/${id}/cancel`, data),

  // Create billing portal session
  createBillingPortalSession: (data: BillingPortalRequest) =>
    apiClient.post<ApiResponse<{ url: string }>, BillingPortalRequest>("/subscriptions/billing-portal", data),

  // Admin: Get all subscriptions
  getAllSubscriptions: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    plan?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.plan) searchParams.append('plan', params.plan);
    
    const query = searchParams.toString();
    const endpoint = `/admin/subscriptions${query ? `?${query}` : ''}`;
    
    return apiClient.get<ApiResponse<PaginatedSubscriptionsResponse>>(endpoint);
  },
};
