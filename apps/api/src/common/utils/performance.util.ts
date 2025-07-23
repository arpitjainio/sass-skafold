import { LoggerService } from '../logger/logger.service';

/**
 * Performance monitoring utility for tracking and optimizing operations
 */
export class PerformanceUtil {
  private static readonly logger = new LoggerService({} as any); // Temporary logger instance

  /**
   * Measure execution time of an async function
   */
  static async measureAsync<T>(
    fn: () => Promise<T>,
    operationName: string,
    context: string = 'Performance',
  ): Promise<T> {
    const startTime = process.hrtime.bigint();

    try {
      const result = await fn();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds

      this.logPerformance(operationName, duration, context);

      return result;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000;

      this.logPerformance(operationName, duration, context, error as Error);
      throw error;
    }
  }

  /**
   * Measure execution time of a synchronous function
   */
  static measureSync<T>(
    fn: () => T,
    operationName: string,
    context: string = 'Performance',
  ): T {
    const startTime = process.hrtime.bigint();

    try {
      const result = fn();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000;

      this.logPerformance(operationName, duration, context);

      return result;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000;

      this.logPerformance(operationName, duration, context, error as Error);
      throw error;
    }
  }

  /**
   * Create a performance decorator for methods
   */
  static performanceDecorator(operationName?: string) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      const method = descriptor.value;
      const opName =
        operationName || `${target.constructor.name}.${propertyKey}`;

      descriptor.value = async function (...args: any[]) {
        return PerformanceUtil.measureAsync(
          () => method.apply(this, args),
          opName,
          target.constructor.name,
        );
      };

      return descriptor;
    };
  }

  /**
   * Monitor memory usage
   */
  static getMemoryUsage(): {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  } {
    const usage = process.memoryUsage();

    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024), // MB
    };
  }

  /**
   * Check if memory usage is high
   */
  static isMemoryUsageHigh(threshold: number = 80): boolean {
    const usage = this.getMemoryUsage();
    const memoryUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;

    return memoryUsagePercent > threshold;
  }

  /**
   * Get CPU usage (approximate)
   */
  static getCpuUsage(): number {
    const startUsage = process.cpuUsage();

    // Small delay to measure CPU usage
    const startTime = Date.now();
    while (Date.now() - startTime < 100) {
      // Busy wait for 100ms
    }

    const endUsage = process.cpuUsage(startUsage);
    const totalCpuTime = endUsage.user + endUsage.system;

    return totalCpuTime / 1000000; // Convert to seconds
  }

  /**
   * Batch operations for better performance
   */
  static async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    operationName: string = 'BatchProcess',
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const batchResults = await this.measureAsync(
        async () => Promise.all(batch.map(processor)),
        `${operationName}_Batch_${Math.floor(i / batchSize) + 1}`,
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Debounce function with performance tracking
   */
  static debounceWithTracking<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    operationName: string = 'DebouncedOperation',
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    let callCount = 0;

    return (...args: Parameters<T>) => {
      callCount++;
      clearTimeout(timeout);

      timeout = setTimeout(async () => {
        await this.measureAsync(
          () => func(...args),
          `${operationName}_Executed_${callCount}`,
        );
      }, wait);
    };
  }

  /**
   * Throttle function with performance tracking
   */
  static throttleWithTracking<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
    operationName: string = 'ThrottledOperation',
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    let callCount = 0;

    return async (...args: Parameters<T>) => {
      callCount++;

      if (!inThrottle) {
        inThrottle = true;

        await this.measureAsync(
          () => func(...args),
          `${operationName}_Executed_${callCount}`,
        );

        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Cache with performance monitoring
   */
  static createCachedFunction<T extends (...args: any[]) => any>(
    fn: T,
    ttl: number = 5 * 60 * 1000, // 5 minutes
    operationName: string = 'CachedOperation',
  ): T {
    const cache = new Map<string, { data: any; timestamp: number }>();

    return (async (...args: Parameters<T>) => {
      const cacheKey = JSON.stringify(args);
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }

      const result = await this.measureAsync(
        () => fn(...args),
        `${operationName}_CacheMiss`,
      );

      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    }) as T;
  }

  /**
   * Log performance metrics
   */
  private static logPerformance(
    operationName: string,
    duration: number,
    context: string,
    error?: Error,
  ): void {
    const level = duration > 1000 ? 'warn' : duration > 500 ? 'info' : 'debug';
    const message = `${operationName} completed in ${duration.toFixed(2)}ms`;

    const meta = {
      operationName,
      duration: Math.round(duration),
      memoryUsage: this.getMemoryUsage(),
      error: error?.message,
    };

    switch (level) {
      case 'warn':
        this.logger.warn(message, context, meta);
        break;
      case 'info':
        this.logger.log(message, context, meta);
        break;
      default:
        this.logger.debug(message, context, meta);
    }
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(): {
    memory: ReturnType<typeof PerformanceUtil.getMemoryUsage>;
    uptime: number;
    cpuUsage: number;
    isMemoryHigh: boolean;
  } {
    return {
      memory: this.getMemoryUsage(),
      uptime: process.uptime(),
      cpuUsage: this.getCpuUsage(),
      isMemoryHigh: this.isMemoryUsageHigh(),
    };
  }
}
