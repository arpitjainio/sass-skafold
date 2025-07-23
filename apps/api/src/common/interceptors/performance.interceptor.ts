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

export interface PerformanceMetrics {
  method: string;
  url: string;
  duration: number;
  statusCode: number;
  userId?: string;
  timestamp: string;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second
  private readonly VERY_SLOW_REQUEST_THRESHOLD = 5000; // 5 seconds

  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();

        const metrics: PerformanceMetrics = {
          method: request.method,
          url: request.url,
          duration,
          statusCode: response.statusCode,
          userId: this.extractUserId(request),
          timestamp: new Date().toISOString(),
          memoryUsage: {
            heapUsed: Math.round(
              (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024,
            ), // MB
            heapTotal: Math.round(endMemory.heapTotal / 1024 / 1024), // MB
            external: Math.round(endMemory.external / 1024 / 1024), // MB
          },
        };

        this.logPerformance(metrics);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const errorObj = error as Error & { status?: number };

        const metrics: PerformanceMetrics = {
          method: request.method,
          url: request.url,
          duration,
          statusCode: errorObj.status || 500,
          userId: this.extractUserId(request),
          timestamp: new Date().toISOString(),
          memoryUsage: {
            heapUsed: Math.round(
              (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024,
            ),
            heapTotal: Math.round(endMemory.heapTotal / 1024 / 1024),
            external: Math.round(endMemory.external / 1024 / 1024),
          },
        };

        this.logPerformance(metrics, errorObj);
        throw error;
      }),
    );
  }

  private extractUserId(request: Request): string | undefined {
    return (request as Request & { user?: { userId: string } }).user?.userId;
  }

  private logPerformance(metrics: PerformanceMetrics, error?: Error): void {
    const { duration, method, url } = metrics;

    // Determine log level based on performance
    if (duration >= this.VERY_SLOW_REQUEST_THRESHOLD) {
      this.logger.error(
        `Very slow request detected: ${method} ${url} took ${duration}ms`,
        error?.stack,
        'Performance',
        metrics as unknown as Record<string, unknown>,
      );
    } else if (duration >= this.SLOW_REQUEST_THRESHOLD) {
      this.logger.warn(
        `Slow request detected: ${method} ${url} took ${duration}ms`,
        'Performance',
        metrics as unknown as Record<string, unknown>,
      );
    } else if (duration > 500) {
      this.logger.log(
        `Moderate request time: ${method} ${url} took ${duration}ms`,
        'Performance',
        metrics as unknown as Record<string, unknown>,
      );
    } else {
      this.logger.debug(
        `Request completed: ${method} ${url} took ${duration}ms`,
        'Performance',
        metrics as unknown as Record<string, unknown>,
      );
    }

    // Log memory usage if significant
    if (metrics.memoryUsage && metrics.memoryUsage.heapUsed > 50) {
      this.logger.warn(
        `High memory usage detected: ${metrics.memoryUsage.heapUsed}MB for ${method} ${url}`,
        'Performance',
        metrics as unknown as Record<string, unknown>,
      );
    }
  }
}
