import { apiClient, ApiResponse } from "./api";

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string | null;
    email: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>, LoginRequest>("/auth/login", data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>, RegisterRequest>("/auth/register", data),

  getCurrentUser: () =>
    apiClient.get<ApiResponse<UserProfile>>("/users/me"),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse, { email: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse, { token: string; password: string }>("/auth/reset-password", { token, password }),

  logout: () => apiClient.post<ApiResponse, void>("/auth/logout"),

  refreshToken: () =>
    apiClient.post<ApiResponse<{ token: string }>, void>("/auth/refresh"),
};
