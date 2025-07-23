import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PrismaWhereInput,
  PrismaIncludeInput,
  PrismaSelectInput,
  DeepPartial,
} from '../types';

@Injectable()
export abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  async findById(id: string, include?: PrismaIncludeInput): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({
      where: { id },
      include,
    }) as Promise<T | null>;
  }

  async findMany(
    where?: PrismaWhereInput,
    include?: PrismaIncludeInput,
  ): Promise<T[]> {
    return this.prisma[this.modelName].findMany({
      where,
      include,
    }) as Promise<T[]>;
  }

  async create(data: DeepPartial<T>, include?: PrismaIncludeInput): Promise<T> {
    return this.prisma[this.modelName].create({
      data,
      include,
    }) as Promise<T>;
  }

  async update(
    id: string,
    data: DeepPartial<T>,
    include?: PrismaIncludeInput,
  ): Promise<T> {
    return this.prisma[this.modelName].update({
      where: { id },
      data,
      include,
    }) as Promise<T>;
  }

  async delete(id: string): Promise<T> {
    return this.prisma[this.modelName].delete({
      where: { id },
    }) as Promise<T>;
  }

  async findUnique(
    where: PrismaWhereInput,
    include?: PrismaIncludeInput,
  ): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({
      where,
      include,
    }) as Promise<T | null>;
  }

  async findFirst(
    where: PrismaWhereInput,
    include?: PrismaIncludeInput,
  ): Promise<T | null> {
    return this.prisma[this.modelName].findFirst({
      where,
      include,
    }) as Promise<T | null>;
  }

  async count(where?: PrismaWhereInput): Promise<number> {
    return this.prisma[this.modelName].count({
      where,
    });
  }

  async exists(where: PrismaWhereInput): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  async findManyWithPagination(
    where?: PrismaWhereInput,
    include?: PrismaIncludeInput,
    page: number = 1,
    limit: number = 10,
    orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

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

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
