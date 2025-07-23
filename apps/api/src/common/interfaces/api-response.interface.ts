export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta: {
    timestamp: string;
    path: string;
    method: string;
    duration?: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  meta: {
    timestamp: string;
    path?: string;
    method?: string;
    errorCode?: string;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta: {
    timestamp: string;
    path?: string;
    method?: string;
    duration?: number;
  };
}
