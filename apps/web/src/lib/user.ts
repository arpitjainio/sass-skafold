import { apiClient, ApiResponse, PaginatedResponse } from "./api";

// User API
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export const userApi = {
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) =>
    apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      "/users" + (params ? `?${new URLSearchParams(params as any)}` : "")
    ),

  getUser: (id: number) => apiClient.get<ApiResponse<User>>(`/users/${id}`),

  createUser: (data: CreateUserRequest) =>
    apiClient.post<ApiResponse<User>>("/users", data),

  updateUser: (id: number, data: UpdateUserRequest) =>
    apiClient.put<ApiResponse<User>>(`/users/${id}`, data),

  deleteUser: (id: number) => apiClient.delete<ApiResponse>(`/users/${id}`),
};
