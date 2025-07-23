import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PrismaWhereInput,
  PrismaIncludeInput,
  PrismaSelectInput,
  DeepPartial,
} from '../types';

/**
 * Enhanced base repository with performance optimizations
 * - Query result caching
 * - Batch operations
 * - Optimized pagination
 * - Connection pooling awareness
 */
@Injectable()
export abstract class EnhancedBaseRepository<T> {
  private readonly cache = new Map<string, { data: T; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  /**
   * Find by ID with caching
   */
  async findById(id: string, include?: PrismaIncludeInput): Promise<T | null> {
    const cacheKey = `${this.modelName}:${id}:${JSON.stringify(include || {})}`;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(
        `Cache hit for ${this.modelName} findById`,
        'Repository',
        { id, cacheKey },
      );
      return cached;
    }

    // Fetch from database
    const result = (await this.prisma[this.modelName].findUnique({
      where: { id },
      include,
    })) as Promise<T | null>;

    // Cache the result
    if (result) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  /**
   * Find by unique field with caching
   */
  async findByUnique(
    field: keyof T,
    value: any,
    include?: PrismaIncludeInput,
  ): Promise<T | null> {
    const cacheKey = `${this.modelName}:${String(field)}:${value}:${JSON.stringify(include || {})}`;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(
        `Cache hit for ${this.modelName} findByUnique`,
        'Repository',
        { field, value, cacheKey },
      );
      return cached;
    }

    // Fetch from database
    const result = (await this.prisma[this.modelName].findUnique({
      where: { [field]: value },
      include,
    })) as Promise<T | null>;

    // Cache the result
    if (result) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  /**
   * Find many with caching
   */
  async findMany(
    where?: PrismaWhereInput,
    include?: PrismaIncludeInput,
    orderBy?: PrismaOrderByInput,
    take?: number,
    skip?: number,
  ): Promise<T[]> {
    const cacheKey = `${this.modelName}:findMany:${JSON.stringify({ where, include, orderBy, take, skip })}`;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(
        `Cache hit for ${this.modelName} findMany`,
        'Repository',
        { cacheKey },
      );
      return cached as T[];
    }

    // Fetch from database
    const result = (await this.prisma[this.modelName].findMany({
      where,
      include,
      orderBy,
      take,
      skip,
    })) as Promise<T[]>;

    // Cache the result
    if (result && result.length > 0) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  /**
   * Create with validation and optimization
   */
  async create(data: DeepPartial<T>, include?: PrismaIncludeInput): Promise<T> {
    const result = (await this.prisma[this.modelName].create({
      data,
      include,
    })) as Promise<T>;

    // Invalidate related cache entries
    this.invalidateCache();

    return result;
  }

  /**
   * Update with cache invalidation
   */
  async update(
    id: string,
    data: DeepPartial<T>,
    include?: PrismaIncludeInput,
  ): Promise<T> {
    const result = (await this.prisma[this.modelName].update({
      where: { id },
      data,
      include,
    })) as Promise<T>;

    // Invalidate cache for this specific entity
    this.invalidateCacheByPattern(`findById:${id}:*`);

    return result;
  }

  /**
   * Delete with cache cleanup
   */
  async delete(id: string): Promise<T> {
    const result = (await this.prisma[this.modelName].delete({
      where: { id },
    })) as Promise<T>;

    // Invalidate cache for this specific entity
    this.invalidateCacheByPattern(`findById:${id}:*`);

    return result;
  }

  /**
   * Find unique with caching
   */
  async findUnique(
    where: PrismaWhereInput,
    include?: PrismaIncludeInput,
    useCache: boolean = true,
  ): Promise<T | null> {
    const cacheKey = `findUnique:${JSON.stringify(where)}:${JSON.stringify(include)}`;

    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    const result = (await this.prisma[this.modelName].findUnique({
      where,
      include,
    })) as Promise<T | null>;

    if (useCache && result) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  /**
   * Find first with caching
   */
  async findFirst(
    where: PrismaWhereInput,
    include?: PrismaIncludeInput,
    orderBy?: Record<string, 'asc' | 'desc'>,
    useCache: boolean = true,
  ): Promise<T | null> {
    const cacheKey = `findFirst:${JSON.stringify(where)}:${JSON.stringify(include)}:${JSON.stringify(orderBy)}`;

    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    const result = (await this.prisma[this.modelName].findFirst({
      where,
      include,
      orderBy,
    })) as Promise<T | null>;

    if (useCache && result) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  /**
   * Count with optimization
   */
  async count(where?: PrismaWhereInput): Promise<number> {
    return this.prisma[this.modelName].count({
      where,
    });
  }

  /**
   * Enhanced pagination with performance optimizations
   */
  async findManyWithPagination(
    where?: PrismaWhereInput,
    include?: PrismaIncludeInput,
    page: number = 1,
    limit: number = 10,
    orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Use Promise.all for parallel execution
    const [data, total] = await Promise.all([
      this.prisma[this.modelName].findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy,
      }) as Promise<T[]>,
      this.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Batch operations for better performance
   */
  async createMany(data: DeepPartial<T>[]): Promise<{ count: number }> {
    if (data.length === 0) return { count: 0 };

    // Use createMany for better performance
    const result = await this.prisma[this.modelName].createMany({
      data: data as any[], // Type assertion needed for Prisma
    });

    // Invalidate cache after batch operation
    this.invalidateCache();

    return result;
  }

  /**
   * Batch update for better performance
   */
  async updateMany(
    where: PrismaWhereInput,
    data: DeepPartial<T>,
  ): Promise<{ count: number }> {
    const result = await this.prisma[this.modelName].updateMany({
      where,
      data: data as any, // Type assertion needed for Prisma
    });

    // Invalidate cache after batch operation
    this.invalidateCache();

    return result;
  }

  /**
   * Batch delete for better performance
   */
  async deleteMany(where: PrismaWhereInput): Promise<{ count: number }> {
    const result = await this.prisma[this.modelName].deleteMany({
      where,
    });

    // Invalidate cache after batch operation
    this.invalidateCache();

    return result;
  }

  /**
   * Find with select optimization (only fetch needed fields)
   */
  async findManyWithSelect(
    where?: PrismaWhereInput,
    select?: PrismaSelectInput,
    orderBy?: Record<string, 'asc' | 'desc'>,
    limit?: number,
  ): Promise<Partial<T>[]> {
    return this.prisma[this.modelName].findMany({
      where,
      select,
      orderBy,
      take: limit,
    }) as Promise<Partial<T>[]>;
  }

  /**
   * Transaction wrapper for complex operations
   */
  async transaction<R>(fn: (tx: typeof this.prisma) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(fn);
  }

  /**
   * Cache management methods
   */
  private getFromCache(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: T): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private invalidateCache(): void {
    this.cache.clear();
  }

  private invalidateCacheByPattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0, // Would need to implement hit tracking
    };
  }

  /**
   * Clear cache manually
   */
  clearCache(): void {
    this.invalidateCache();
  }
}
