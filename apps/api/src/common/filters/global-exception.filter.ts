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
import { Prisma } from '../../../generated/prisma/client';

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
      const exceptionStatus = exception.getStatus();
      status = exceptionStatus;
      const exceptionResponse = exception.getResponse() as ExceptionResponse;

      message = this.extractMessage(exceptionResponse, exception.message);
      errors = this.extractErrors(exceptionResponse, exception.message);

      // Map HTTP status to error codes
      errorCode = this.mapStatusToErrorCode(exceptionStatus);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaException = exception as Prisma.PrismaClientKnownRequestError;
      status = this.mapPrismaStatus(prismaException.code);
      message = this.mapPrismaMessage(prismaException);
      errors = [message];
      errorCode = `PRISMA_${prismaException.code}`;
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid database request';
      errors = [message];
      errorCode = 'PRISMA_VALIDATION_ERROR';
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection is not available';
      errors = [message];
      errorCode = 'PRISMA_INITIALIZATION_ERROR';
    } else if (exception instanceof Error) {
      message = 'An unexpected server error occurred';
      errors = [message];
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

  private extractMessage(
    exceptionResponse: ExceptionResponse,
    fallbackMessage: string,
  ): string {
    if (typeof exceptionResponse.message === 'string') {
      return exceptionResponse.message;
    }
    if (
      Array.isArray(exceptionResponse.message) &&
      exceptionResponse.message.length > 0
    ) {
      return exceptionResponse.message[0];
    }
    return fallbackMessage;
  }

  private extractErrors(
    exceptionResponse: ExceptionResponse,
    fallbackMessage: string,
  ): string[] {
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
    const statusCodeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
    };

    return statusCodeMap[status] ?? 'UNKNOWN_ERROR';
  }

  private mapPrismaStatus(code: string): number {
    switch (code) {
      case 'P2002':
        return HttpStatus.CONFLICT;
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      case 'P2003':
      case 'P2011':
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private mapPrismaMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    switch (exception.code) {
      case 'P2002': {
        const target = Array.isArray(exception.meta?.target)
          ? exception.meta.target.join(', ')
          : String(exception.meta?.target ?? '');

        if (target.includes('email')) {
          return 'A user with this email already exists';
        }

        return 'A record with the same unique value already exists';
      }
      case 'P2003':
        return 'This operation references related data that could not be found';
      case 'P2011':
        return 'A required value is missing';
      case 'P2025':
        return 'The requested record could not be found';
      default:
        return 'A database error occurred while processing your request';
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
