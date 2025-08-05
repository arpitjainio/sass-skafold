import { apiClient, ApiResponse } from "./api";

// Profile API
export interface Profile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  role: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  timezone?: string;
  language?: string;
  notifications?: Partial<Profile["notifications"]>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const profileApi = {
  getProfile: () => apiClient.get<ApiResponse<Profile>>("/profile"),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<ApiResponse<Profile>>("/profile", data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<ApiResponse>("/profile/change-password", data),

  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.post<ApiResponse<{ avatar: string }>>(
      "/profile/avatar",
      formData
    );
  },
};
