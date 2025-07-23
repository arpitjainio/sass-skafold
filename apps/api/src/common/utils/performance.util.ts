import { LoggerService } from '../logger/logger.service';
import { AppConfigService } from '../../config/config.service';

/**
 * Performance monitoring utility for tracking and optimizing operations
 */
export class PerformanceUtil {
  private static readonly logger = new LoggerService({} as AppConfigService); // Temporary logger instance

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
      target: unknown,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      const method = descriptor.value;
      const opName =
        operationName ||
        `${(target as { constructor: { name: string } }).constructor.name}.${propertyKey}`;

      descriptor.value = async function (...args: unknown[]) {
        return PerformanceUtil.measureAsync(
          () => method.call(this, ...args),
          opName,
          (target as { constructor: { name: string } }).constructor.name,
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
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
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
   * Get CPU usage (simplified implementation)
   */
  static getCpuUsage(): number {
    // Simulate CPU usage calculation
    // In a real implementation, you would measure over time
    return Math.random() * 100; // Placeholder
  }

  /**
   * Batch process items with performance tracking
   */
  static async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
  ): Promise<R[]> {
    const results: R[] = [];
    const totalBatches = Math.ceil(items.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batch = items.slice(i * batchSize, (i + 1) * batchSize);
      const batchResults = await Promise.all(
        batch.map((item) => processor(item)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Debounce with performance tracking
   */
  static debounceWithTracking<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number,
    operationName: string = 'DebouncedOperation',
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.measureSync(() => func(...args), operationName);
      }, wait);
    };
  }

  /**
   * Throttle with performance tracking
   */
  static throttleWithTracking<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number,
    operationName: string = 'ThrottledOperation',
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        this.measureSync(() => func(...args), operationName);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Create a cached function with performance tracking
   */
  static createCachedFunction<T extends (...args: unknown[]) => unknown>(
    fn: T,
    ttl: number = 5 * 60 * 1000, // 5 minutes
    operationName: string = 'CachedOperation',
  ): T {
    const cache = new Map<string, { result: unknown; timestamp: number }>();

    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      const cached = cache.get(key);

      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.result;
      }

      const result = this.measureSync(() => fn(...args), operationName);
      cache.set(key, { result, timestamp: Date.now() });

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
    const logContext = {
      operationName,
      duration: `${duration.toFixed(2)}ms`,
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCpuUsage(),
    };

    if (error) {
      this.logger.error(
        `Performance error in ${operationName}`,
        error.stack,
        context,
        logContext,
      );
    } else if (duration > 1000) {
      this.logger.warn(
        `Slow operation detected: ${operationName}`,
        context,
        logContext,
      );
    } else {
      this.logger.debug(
        `Performance metric: ${operationName}`,
        context,
        logContext,
      );
    }
  }

  /**
   * Generate a comprehensive performance report
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
