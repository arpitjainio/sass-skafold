import { LoggerService } from '../logger/logger.service';
import { AppConfigService } from '../../config/config.service';

/**
 * Performance monitoring utility for tracking and optimizing operations
 */
export class PerformanceUtil {
  private static readonly logger = new LoggerService({} as AppConfigService); // Temporary logger instance

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
}
