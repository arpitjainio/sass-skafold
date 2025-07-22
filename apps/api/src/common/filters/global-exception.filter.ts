import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';
import { ResponseUtil } from '../utils/response.util';
import { ExceptionResponse } from '../types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];
    let errorCode = 'INTERNAL_ERROR';

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as ExceptionResponse;
      
      message = this.extractMessage(exceptionResponse, exception.message);
      errors = this.extractErrors(exceptionResponse, exception.message);
      
      // Map HTTP status to error codes
      errorCode = this.mapStatusToErrorCode(status);
    } else if (exception instanceof Error) {
      message = exception.message;
      errors = [exception.message];
      errorCode = 'UNKNOWN_ERROR';
    }

    // Log the error
    this.logger.error(
      `Exception occurred: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      'GlobalException',
      {
        statusCode: status,
        errorCode,
        path: request.url,
        method: request.method,
        userId: this.extractUserId(request),
        ip: this.getClientIp(request),
        userAgent: request.get('User-Agent'),
      },
    );

    // Create standardized error response
    const errorResponse = ResponseUtil.error(message, errors, {
      path: request.url,
      method: request.method,
      errorCode,
    });

    response.status(status).json(errorResponse);
  }

  private extractMessage(exceptionResponse: ExceptionResponse, fallbackMessage: string): string {
    if (typeof exceptionResponse.message === 'string') {
      return exceptionResponse.message;
    }
    if (Array.isArray(exceptionResponse.message) && exceptionResponse.message.length > 0) {
      return exceptionResponse.message[0];
    }
    return fallbackMessage;
  }

  private extractErrors(exceptionResponse: ExceptionResponse, fallbackMessage: string): string[] {
    if (Array.isArray(exceptionResponse.message)) {
      return exceptionResponse.message;
    }
    if (typeof exceptionResponse.message === 'string') {
      return [exceptionResponse.message];
    }
    return [fallbackMessage];
  }

  private extractUserId(request: Request): string | undefined {
    return (request as Request & { user?: { userId: string } }).user?.userId;
  }

  private mapStatusToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_ERROR';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMIT_EXCEEDED';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
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