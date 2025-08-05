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
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/register", data),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse>("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse>("/auth/reset-password", { token, password }),

  logout: () => apiClient.post<ApiResponse>("/auth/logout"),

  refreshToken: () =>
    apiClient.post<ApiResponse<{ token: string }>>("/auth/refresh"),
};
