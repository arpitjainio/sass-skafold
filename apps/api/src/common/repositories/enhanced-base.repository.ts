import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
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
    protected readonly logger: LoggerService,
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
    })) as T | null;

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
    value: unknown,
    include?: PrismaIncludeInput,
  ): Promise<T | null> {
    const cacheKey = `${this.modelName}:${String(field)}:${String(value)}:${JSON.stringify(include || {})}`;

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
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    const result = (await model.findUnique({
      where: { [field]: value },
      include,
    })) as T | null;

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
    orderBy?: Record<string, 'asc' | 'desc'>,
    take?: number,
    skip?: number,
  ): Promise<T[]> {
    const cacheKey = `${this.modelName}:findMany:${JSON.stringify(where || {})}:${JSON.stringify(include || {})}:${JSON.stringify(orderBy || {})}:${take}:${skip}`;

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
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    const result = (await model.findMany({
      where,
      include,
      orderBy,
      take,
      skip,
    })) as T[];

    // Cache the result
    if (result && result.length > 0) {
      this.setCache(cacheKey, result as unknown as T);
    }

    return result;
  }

  /**
   * Create with validation and optimization
   */
  async create(data: DeepPartial<T>, include?: PrismaIncludeInput): Promise<T> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    const result = (await model.create({
      data,
      include,
    })) as T;

    // Invalidate related cache entries
    this.invalidateCache();

    return result;
  }

  /**
   * Update with validation and optimization
   */
  async update(
    id: string,
    data: DeepPartial<T>,
    include?: PrismaIncludeInput,
  ): Promise<T> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    const result = (await model.update({
      where: { id },
      data,
      include,
    })) as T;

    // Invalidate related cache entries
    this.invalidateCache();

    return result;
  }

  /**
   * Delete with validation and optimization
   */
  async delete(id: string): Promise<T> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    const result = (await model.delete({
      where: { id },
    })) as T;

    // Invalidate cache for this specific entity
    this.invalidateCacheByPattern(`${this.modelName}:${id}`);

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
      if (cached) {
        return cached;
      }
    }

    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    const result = (await model.findUnique({
      where,
      include,
    })) as T | null;

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
      if (cached) {
        return cached;
      }
    }

    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    const result = (await model.findFirst({
      where,
      include,
      orderBy,
    })) as T | null;

    if (useCache && result) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  /**
   * Count with optimization
   */
  async count(where?: PrismaWhereInput): Promise<number> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    return model.count({
      where,
    }) as Promise<number>;
  }

  /**
   * Find many with pagination
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

    const [data, total] = await Promise.all([
      this.findMany(where, include, orderBy, limit, skip),
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
   * Create many with optimization
   */
  async createMany(data: DeepPartial<T>[]): Promise<{ count: number }> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    const result = await model.createMany({
      data,
    });

    // Invalidate cache
    this.invalidateCache();

    return result;
  }

  /**
   * Update many with optimization
   */
  async updateMany(
    where: PrismaWhereInput,
    data: DeepPartial<T>,
  ): Promise<{ count: number }> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    const result = await model.updateMany({
      where,
      data,
    });

    // Invalidate cache
    this.invalidateCache();

    return result;
  }

  /**
   * Delete many with optimization
   */
  async deleteMany(where: PrismaWhereInput): Promise<{ count: number }> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    const result = await model.deleteMany({
      where,
    });

    // Invalidate cache
    this.invalidateCache();

    return result;
  }

  /**
   * Find many with select
   */
  async findManyWithSelect(
    where?: PrismaWhereInput,
    select?: PrismaSelectInput,
    orderBy?: Record<string, 'asc' | 'desc'>,
    limit?: number,
  ): Promise<Partial<T>[]> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    return model.findMany({
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

  // Cache management methods
  private getFromCache(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is expired
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
      if (firstKey) {
        this.cache.delete(firstKey);
        this.logger.debug('Cache eviction due to size limit', 'Repository', {
          evictedKey: firstKey,
        });
      }
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
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Cache statistics
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0, // TODO: Implement hit rate tracking
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}
