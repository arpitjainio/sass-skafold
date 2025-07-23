import { SetMetadata, UseInterceptors } from '@nestjs/common';
import { CachingInterceptor } from '../interceptors/caching.interceptor';
import { PerformanceInterceptor } from '../interceptors/performance.interceptor';
import { RequestLoggingInterceptor } from '../interceptors/request-logging.interceptor';
import { ResponseTransformInterceptor } from '../interceptors/response-transform.interceptor';

// Metadata keys
export const CACHE_TTL_KEY = 'cache_ttl';
export const CACHE_KEY = 'cache_key';
export const PERFORMANCE_MONITORING_KEY = 'performance_monitoring';
export const REQUEST_LOGGING_KEY = 'request_logging';
export const RESPONSE_TRANSFORM_KEY = 'response_transform';

// Cache decorators
export const Cache = (ttl?: number, key?: string) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      // Method decorator
      SetMetadata(CACHE_TTL_KEY, ttl)(target, propertyKey, descriptor);
      if (key) {
        SetMetadata(CACHE_KEY, key)(target, propertyKey, descriptor);
      }
      UseInterceptors(CachingInterceptor)(target, propertyKey, descriptor);
    } else {
      // Class decorator
      SetMetadata(CACHE_TTL_KEY, ttl)(target);
      if (key) {
        SetMetadata(CACHE_KEY, key)(target);
      }
      UseInterceptors(CachingInterceptor)(target);
    }
  };
};

// Performance monitoring decorators
export const MonitorPerformance = (threshold?: number) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      // Method decorator
      SetMetadata(PERFORMANCE_MONITORING_KEY, threshold)(
        target,
        propertyKey,
        descriptor,
      );
      UseInterceptors(PerformanceInterceptor)(target, propertyKey, descriptor);
    } else {
      // Class decorator
      SetMetadata(PERFORMANCE_MONITORING_KEY, threshold)(target);
      UseInterceptors(PerformanceInterceptor)(target);
    }
  };
};

// Request logging decorators
export const LogRequest = (level: 'debug' | 'log' | 'warn' = 'log') => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      // Method decorator
      SetMetadata(REQUEST_LOGGING_KEY, level)(target, propertyKey, descriptor);
      UseInterceptors(RequestLoggingInterceptor)(
        target,
        propertyKey,
        descriptor,
      );
    } else {
      // Class decorator
      SetMetadata(REQUEST_LOGGING_KEY, level)(target);
      UseInterceptors(RequestLoggingInterceptor)(target);
    }
  };
};

// Response transform decorators
export const TransformResponse = (customMessage?: string) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      // Method decorator
      SetMetadata(RESPONSE_TRANSFORM_KEY, customMessage)(
        target,
        propertyKey,
        descriptor,
      );
      UseInterceptors(ResponseTransformInterceptor)(
        target,
        propertyKey,
        descriptor,
      );
    } else {
      // Class decorator
      SetMetadata(RESPONSE_TRANSFORM_KEY, customMessage)(target);
      UseInterceptors(ResponseTransformInterceptor)(target);
    }
  };
};

// Combined decorators for common use cases
export const ApiEndpoint = (options: {
  cache?: { ttl?: number; key?: string };
  performance?: { threshold?: number };
  logging?: { level?: 'debug' | 'log' | 'warn' };
  transform?: { message?: string };
}) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    const interceptors: any[] = [];

    // Add caching if specified
    if (options.cache) {
      SetMetadata(CACHE_TTL_KEY, options.cache.ttl)(
        target,
        propertyKey,
        descriptor,
      );
      if (options.cache.key) {
        SetMetadata(CACHE_KEY, options.cache.key)(
          target,
          propertyKey,
          descriptor,
        );
      }
      interceptors.push(CachingInterceptor);
    }

    // Add performance monitoring if specified
    if (options.performance) {
      SetMetadata(PERFORMANCE_MONITORING_KEY, options.performance.threshold)(
        target,
        propertyKey,
        descriptor,
      );
      interceptors.push(PerformanceInterceptor);
    }

    // Add request logging if specified
    if (options.logging) {
      SetMetadata(REQUEST_LOGGING_KEY, options.logging.level)(
        target,
        propertyKey,
        descriptor,
      );
      interceptors.push(RequestLoggingInterceptor);
    }

    // Add response transform if specified
    if (options.transform) {
      SetMetadata(RESPONSE_TRANSFORM_KEY, options.transform.message)(
        target,
        propertyKey,
        descriptor,
      );
      interceptors.push(ResponseTransformInterceptor);
    }

    // Apply all interceptors
    if (interceptors.length > 0) {
      UseInterceptors(...interceptors)(target, propertyKey, descriptor);
    }
  };
};

// Utility decorators for common patterns
export const ReadOnly = () =>
  ApiEndpoint({
    cache: { ttl: 5 * 60 * 1000 }, // 5 minutes
    performance: { threshold: 1000 },
    logging: { level: 'debug' },
  });

export const WriteOperation = () =>
  ApiEndpoint({
    performance: { threshold: 2000 },
    logging: { level: 'warn' },
  });

export const SensitiveOperation = () =>
  ApiEndpoint({
    performance: { threshold: 1000 },
    logging: { level: 'warn' },
    transform: { message: 'Operation completed successfully' },
  });
