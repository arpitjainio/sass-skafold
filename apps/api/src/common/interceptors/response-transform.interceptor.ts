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

export interface TransformedResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta: {
    timestamp: string;
    path: string;
    method: string;
    duration?: number;
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

        // If the response is already in our standard format, return as is
        if (this.isStandardResponse(data)) {
          return {
            ...data,
            meta: {
              ...data.meta,
              path: request.url,
              method: request.method,
              duration,
            },
          };
        }

        // If it's an error response, handle it
        if (this.isErrorResponse(data)) {
          return {
            success: false,
            message: data.message || 'An error occurred',
            errors: data.errors || [data.message || 'An error occurred'],
            meta: {
              timestamp: new Date().toISOString(),
              path: request.url,
              method: request.method,
              duration,
            },
          };
        }

        // If it's a paginated response, handle it
        if (this.isPaginatedResponse(data)) {
          return {
            success: true,
            data: data.data,
            message: data.message || 'Data retrieved successfully',
            meta: {
              timestamp: new Date().toISOString(),
              path: request.url,
              method: request.method,
              duration,
              pagination: data.pagination,
            },
          };
        }

        // Default success response
        return {
          success: true,
          data,
          message: this.generateDefaultMessage(request.method),
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            duration,
          },
        };
      }),
    );
  }

  private isStandardResponse(data: any): data is ApiResponse {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.success === 'boolean' &&
      data.meta &&
      typeof data.meta === 'object'
    );
  }

  private isErrorResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      (data.error || data.errors || data.statusCode || data.status)
    );
  }

  private isPaginatedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.data) &&
      data.pagination &&
      typeof data.pagination === 'object'
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
