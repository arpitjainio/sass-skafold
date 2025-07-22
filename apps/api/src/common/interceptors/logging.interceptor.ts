import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';
import { Request, Response } from 'express';
import { HttpRequestData, HttpResponseData } from '../types';

export interface LoggedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  userId?: string;
}

export interface LoggedResponse {
  statusCode: number;
  headers: Record<string, string>;
  body?: Record<string, unknown>;
  duration: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Extract user ID if available
    const userId = this.extractUserId(request);

    // Log request
    const loggedRequest: LoggedRequest = {
      method: request.method,
      url: request.url,
      headers: this.sanitizeHeaders(request.headers),
      body: this.sanitizeBody(request.body),
      query: request.query as Record<string, unknown>,
      params: request.params as Record<string, unknown>,
      ip: this.getClientIp(request),
      userAgent: request.get('User-Agent') || 'Unknown',
      userId,
    };

    this.logger.log('Incoming request', 'HTTP', {
      type: 'request',
      ...loggedRequest,
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const loggedResponse: LoggedResponse = {
          statusCode: response.statusCode,
          headers: this.sanitizeHeaders(response.getHeaders()),
          body: this.sanitizeResponse(data),
          duration,
        };

        // Log successful response
        this.logger.log('Outgoing response', 'HTTP', {
          type: 'response',
          ...loggedResponse,
          request: {
            method: loggedRequest.method,
            url: loggedRequest.url,
            userId: loggedRequest.userId,
          },
        });

        // Log performance for slow requests
        if (duration > 1000) {
          this.logger.warn('Slow request detected', 'HTTP', {
            duration,
            method: loggedRequest.method,
            url: loggedRequest.url,
            userId: loggedRequest.userId,
          });
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const loggedError = {
          type: 'error',
          statusCode: error.status || 500,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          duration,
          request: {
            method: loggedRequest.method,
            url: loggedRequest.url,
            userId: loggedRequest.userId,
          },
        };

        // Log error response
        this.logger.error(
          'Request failed',
          error.stack,
          'HTTP',
          loggedError,
        );

        throw error;
      }),
    );
  }

  private extractUserId(request: Request): string | undefined {
    return (request as Request & { user?: { userId: string } }).user?.userId;
  }

  private sanitizeHeaders(headers: Record<string, unknown>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = String(value);
      }
    }

    return sanitized;
  }

  private sanitizeBody(body: unknown): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object') return undefined;

    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...body as Record<string, unknown> };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sanitizeResponse(data: unknown): Record<string, unknown> | undefined {
    if (!data || typeof data !== 'object') return undefined;

    // Limit response body size for logging
    const stringified = JSON.stringify(data);
    if (stringified.length > 1000) {
      return {
        ...data as Record<string, unknown>,
        _truncated: true,
        _originalSize: stringified.length,
      };
    }

    return data as Record<string, unknown>;
  }

  private getClientIp(request: Request): string {
    return (
      request.get('X-Forwarded-For') ||
      request.get('X-Real-IP') ||
      request.ip ||
      (request.connection as { remoteAddress?: string }).remoteAddress ||
      'Unknown'
    );
  }
} 