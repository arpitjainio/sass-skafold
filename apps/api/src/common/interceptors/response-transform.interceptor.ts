import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

export interface TransformedResponse<T = unknown> {
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

interface ErrorResponse {
  message?: string;
  errors?: string[];
  error?: string;
  statusCode?: number;
  status?: number;
}

interface PaginatedResponse {
  data: unknown[];
  message?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformedResponse> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const duration = Date.now() - startTime;
        const timestamp = new Date().toISOString();

        // If the response is already in our standard format, return as is
        if (this.isStandardResponse(data)) {
          return {
            ...data,
            meta: {
              ...data.meta,
              timestamp: data.meta?.timestamp || timestamp,
              path: request.url,
              method: request.method,
              duration,
            },
          };
        }

        // If it's an error response, handle it
        if (this.isErrorResponse(data)) {
          const errorData = data;
          return {
            success: false,
            message: errorData.message || 'An error occurred',
            errors: errorData.errors || [
              errorData.message || 'An error occurred',
            ],
            meta: {
              timestamp,
              path: request.url,
              method: request.method,
              duration,
            },
          };
        }

        // If it's a paginated response, handle it
        if (this.isPaginatedResponse(data)) {
          const paginatedData = data;
          return {
            success: true,
            data: paginatedData.data,
            message: paginatedData.message || 'Data retrieved successfully',
            meta: {
              timestamp,
              path: request.url,
              method: request.method,
              duration,
              pagination: paginatedData.pagination,
            },
          };
        }

        // Default success response
        return {
          success: true,
          data,
          message: this.generateDefaultMessage(request.method),
          meta: {
            timestamp,
            path: request.url,
            method: request.method,
            duration,
          },
        };
      }),
    );
  }

  private isStandardResponse(data: unknown): data is ApiResponse {
    const obj = data as Record<string, unknown>;
    return (
      data !== null &&
      typeof data === 'object' &&
      'success' in data &&
      typeof obj.success === 'boolean' &&
      'meta' in data &&
      typeof obj.meta === 'object'
    );
  }

  private isErrorResponse(data: unknown): data is ErrorResponse {
    return (
      data !== null &&
      typeof data === 'object' &&
      ('error' in data ||
        'errors' in data ||
        'statusCode' in data ||
        'status' in data)
    );
  }

  private isPaginatedResponse(data: unknown): data is PaginatedResponse {
    const obj = data as Record<string, unknown>;
    return (
      data !== null &&
      typeof data === 'object' &&
      'data' in data &&
      Array.isArray(obj.data) &&
      'pagination' in data &&
      typeof obj.pagination === 'object'
    );
  }

  private generateDefaultMessage(method: string): string {
    const messages = {
      GET: 'Data retrieved successfully',
      POST: 'Resource created successfully',
      PUT: 'Resource updated successfully',
      PATCH: 'Resource updated successfully',
      DELETE: 'Resource deleted successfully',
    };
    return (
      messages[method as keyof typeof messages] ||
      'Operation completed successfully'
    );
  }
}
