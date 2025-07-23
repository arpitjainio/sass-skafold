import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { LoggerService } from '../logger/logger.service';
import { Request } from 'express';

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
  timestamp: string;
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    // Extract user ID if available
    const userId = this.extractUserId(request);

    // Log request details
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
      timestamp: new Date().toISOString(),
    };

    // Log request with appropriate level based on method
    const logLevel = this.getLogLevel(request.method);
    const logMessage = `Incoming ${request.method} request to ${request.url}`;

    this.logger[logLevel](logMessage, 'RequestLogging', {
      type: 'request',
      ...loggedRequest,
    });

    // Add request timing to the request object for use in response interceptor
    (request as Request & { startTime: number }).startTime = startTime;

    return next.handle();
  }

  private extractUserId(request: Request): string | undefined {
    return (request as Request & { user?: { userId: string } }).user?.userId;
  }

  private sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ];

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

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'access_token',
      'refresh_token',
    ];
    const sanitized = { ...(body as Record<string, unknown>) };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
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

  private getLogLevel(method: string): 'debug' | 'log' | 'warn' {
    // Log sensitive operations at warn level
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return 'warn';
    }
    // Log GET requests at debug level to reduce noise
    if (method === 'GET') {
      return 'debug';
    }
    // Default to log level
    return 'log';
  }
}
