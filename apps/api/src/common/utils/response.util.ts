import {
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
  PaginatedResponse,
} from '../interfaces/api-response.interface';

export class ResponseUtil {
  /**
   * Create a successful response with metadata
   */
  static success<T>(
    data: T,
    message?: string,
    meta?: Partial<ApiResponse['meta']>,
  ): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  /**
   * Create an error response with metadata
   */
  static error(
    message: string,
    errors?: string[],
    meta?: Partial<ErrorResponse['meta']>,
  ): ErrorResponse {
    return {
      success: false,
      message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    meta?: Partial<ApiResponse['meta']>,
  ): SuccessResponse<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        ...meta,
      },
    };
  }

  /**
   * Create a simple success message response
   */
  static message(
    message: string,
    meta?: Partial<ApiResponse['meta']>,
  ): SuccessResponse<{ message: string }> {
    return {
      success: true,
      data: { message },
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  /**
   * Create a response with custom data structure
   */
  static custom<T>(
    data: T,
    success: boolean = true,
    message?: string,
    meta?: Partial<ApiResponse['meta']>,
  ): ApiResponse<T> {
    return {
      success,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }
} 