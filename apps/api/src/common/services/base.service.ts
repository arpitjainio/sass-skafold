import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ResponseUtil } from '../utils/response.util';
import { SuccessResponse } from '../interfaces/api-response.interface';

@Injectable()
export abstract class BaseService {
  constructor(protected readonly logger: LoggerService) {}

  /**
   * Standard method to handle entity not found scenarios
   */
  protected handleEntityNotFound<T>(
    entity: T | null,
    entityName: string,
    identifier: string,
    context: string,
  ): T {
    if (!entity) {
      this.logger.warn(`${entityName} not found`, context, { identifier });
      throw new NotFoundException(`${entityName} not found`);
    }
    
    this.logger.debug(`${entityName} found`, context, { identifier });
    return entity;
  }

  /**
   * Standard method to create success responses
   */
  protected createSuccessResponse<T>(
    data: T,
    message: string,
    context: string,
    meta?: Record<string, unknown>,
  ): SuccessResponse<T> {
    this.logger.log(message, context, meta);
    return ResponseUtil.success(data, message, meta);
  }

  /**
   * Standard method to log operations
   */
  protected logOperation(
    operation: string,
    context: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.log(operation, context, meta);
  }

  /**
   * Standard method to log warnings
   */
  protected logWarning(
    message: string,
    context: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.warn(message, context, meta);
  }

  /**
   * Standard method to log errors
   */
  protected logError(
    message: string,
    error: Error | string,
    context: string,
    meta?: Record<string, unknown>,
  ): void {
    const stack = error instanceof Error ? error.stack : undefined;
    this.logger.error(message, stack, context, meta);
  }

  /**
   * Standard method to log debug information
   */
  protected logDebug(
    message: string,
    context: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.debug(message, context, meta);
  }

  /**
   * Utility method to safely extract user ID from request
   */
  protected extractUserId(request: { user?: { userId: string } }): string | undefined {
    return request.user?.userId;
  }

  /**
   * Utility method to validate required fields
   */
  protected validateRequiredFields<T extends Record<string, unknown>>(
    data: T,
    requiredFields: (keyof T)[],
    context: string,
  ): void {
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
      this.logWarning(errorMessage, context, { missingFields });
      throw new Error(errorMessage);
    }
  }

  /**
   * Utility method to sanitize sensitive data for logging
   */
  protected sanitizeForLogging<T extends Record<string, unknown>>(
    data: T,
    sensitiveFields: string[] = ['password', 'token', 'secret', 'key'],
  ): T {
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        (sanitized as Record<string, unknown>)[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
} 