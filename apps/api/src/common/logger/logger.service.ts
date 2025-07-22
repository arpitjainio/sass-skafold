import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { AppConfigService } from '../../config/config.service';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogContext {
  [key: string]: unknown;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private configService: AppConfigService) {
    this.initializeLogger();
  }

  private initializeLogger(): void {
    const isDevelopment = this.configService.isDevelopment;
    const logLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
        const contextStr = context ? `[${context}] ` : '';
        const traceStr = trace ? `\n${trace}` : '';
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level.toUpperCase()}] ${contextStr}${message}${metaStr}${traceStr}`;
      }),
    );

    // Define transports
    const transports: winston.transport[] = [
      // Console transport for development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    ];

    // File transports for production
    if (!isDevelopment) {
      // Error logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: LogLevel.ERROR,
          maxSize: '20m',
          maxFiles: '14d',
          format: logFormat,
        }),
      );

      // Combined logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          format: logFormat,
        }),
      );

      // Application logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: LogLevel.INFO,
          maxSize: '20m',
          maxFiles: '30d',
          format: logFormat,
        }),
      );
    }

    this.logger = winston.createLogger({
      level: logLevel,
      format: logFormat,
      transports,
      exitOnError: false,
    });
  }

  log(message: string, context?: string, meta?: LogContext): void {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: LogContext): void {
    this.logger.error(message, { context, trace, ...meta });
  }

  warn(message: string, context?: string, meta?: LogContext): void {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: LogContext): void {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: LogContext): void {
    this.logger.verbose(message, { context, ...meta });
  }

  // Custom methods for different contexts
  logAuth(message: string, userId?: string, meta?: LogContext): void {
    this.log(message, 'Auth', { userId, ...meta });
  }

  logUser(message: string, userId?: string, meta?: LogContext): void {
    this.log(message, 'User', { userId, ...meta });
  }

  logSubscription(message: string, userId?: string, subscriptionId?: string, meta?: LogContext): void {
    this.log(message, 'Subscription', { userId, subscriptionId, ...meta });
  }

  logStripe(message: string, eventType?: string, meta?: LogContext): void {
    this.log(message, 'Stripe', { eventType, ...meta });
  }

  logDatabase(message: string, operation?: string, meta?: LogContext): void {
    this.log(message, 'Database', { operation, ...meta });
  }

  // Performance logging
  logPerformance(operation: string, duration: number, context?: string, meta?: LogContext): void {
    this.log(`Performance: ${operation} took ${duration}ms`, context, { duration, ...meta });
  }

  // Security logging
  logSecurity(event: string, userId?: string, ip?: string, meta?: LogContext): void {
    this.warn(`Security: ${event}`, 'Security', { userId, ip, ...meta });
  }
} 