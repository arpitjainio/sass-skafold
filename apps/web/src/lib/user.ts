import { apiClient, ApiResponse } from "./api";

// User API types
export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  subscriptionCount: number;
  hasActiveSubscription: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  roles?: string[];
}

export interface PaginatedUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const userApi = {
  // Get current user profile
  getProfile: () =>
    apiClient.get<ApiResponse<UserProfile>>("/users/me"),

  // Update current user profile
  updateProfile: (data: UpdateUserRequest) =>
    apiClient.put<ApiResponse<UserProfile>, UpdateUserRequest>("/users/me", data),

  // Get user roles
  getUserRoles: () =>
    apiClient.get<ApiResponse<string[]>>("/users/roles"),

  // Admin: Get all users
  getAllUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    const endpoint = `/admin/users${query ? `?${query}` : ''}`;
    
    return apiClient.get<ApiResponse<PaginatedUsersResponse>>(endpoint);
  },

  // Admin: Get user by ID
  getUserById: (id: string) =>
    apiClient.get<ApiResponse<User>>(`/admin/users/${id}`),

  // Admin: Update user
  updateUser: (id: string, data: UpdateUserRequest) =>
    apiClient.put<ApiResponse<User>, UpdateUserRequest>(`/admin/users/${id}`, data),

  // Admin: Delete user
  deleteUser: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/admin/users/${id}`),
};
