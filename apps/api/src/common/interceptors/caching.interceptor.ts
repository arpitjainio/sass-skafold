import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';
import { Request } from 'express';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
  invalidate?: boolean; // Whether to invalidate cache
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class CachingInterceptor implements NestInterceptor {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000;

  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;

    // Only cache GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(request);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for ${method} ${url}`, 'Caching', {
        cacheKey,
      });
      return of(cached);
    }

    this.logger.debug(`Cache miss for ${method} ${url}`, 'Caching', {
      cacheKey,
    });

    return next.handle().pipe(
      tap((data) => {
        this.setCache(cacheKey, data, this.DEFAULT_TTL);
        this.logger.debug(`Cached response for ${method} ${url}`, 'Caching', {
          cacheKey,
        });
      }),
    );
  }

  private generateCacheKey(request: Request): string {
    const { method, url, query, params } = request;
    const queryString =
      Object.keys(query).length > 0 ? JSON.stringify(query) : '';
    const paramsString =
      Object.keys(params).length > 0 ? JSON.stringify(params) : '';

    return `${method}:${url}:${queryString}:${paramsString}`;
  }

  private getFromCache(key: string): unknown {
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: unknown, ttl: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.logger.debug('Cache eviction due to size limit', 'Caching', {
        evictedKey: firstKey,
      });
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private invalidateCacheByPattern(pattern: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.logger.debug('Cache invalidated', 'Caching', {
        invalidatedKey: key,
        pattern,
      });
    });
  }

  // Public method to manually invalidate cache
  public invalidateCache(pattern?: string): void {
    if (pattern) {
      this.invalidateCacheByPattern(pattern);
    } else {
      this.cache.clear();
      this.logger.debug('All cache cleared', 'Caching');
    }
  }

  // Public method to get cache statistics
  public getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0, // Would need to implement hit tracking
    };
  }
}
