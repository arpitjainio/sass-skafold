import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaWhereInput, PrismaIncludeInput, DeepPartial } from '../types';

@Injectable()
export abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  async findById(id: string, include?: PrismaIncludeInput): Promise<T | null> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    return model.findUnique({
      where: { id },
      include,
    }) as Promise<T | null>;
  }

  async findMany(
    where?: PrismaWhereInput,
    include?: PrismaIncludeInput,
  ): Promise<T[]> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    return model.findMany({
      where,
      include,
    }) as Promise<T[]>;
  }

  async create(data: DeepPartial<T>, include?: PrismaIncludeInput): Promise<T> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    return model.create({
      data,
      include,
    }) as Promise<T>;
  }

  async update(
    id: string,
    data: DeepPartial<T>,
    include?: PrismaIncludeInput,
  ): Promise<T> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    return model.update({
      where: { id },
      data,
      include,
    }) as Promise<T>;
  }

  async delete(id: string): Promise<T> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    return model.delete({
      where: { id },
    }) as Promise<T>;
  }

  async findUnique(
    where: PrismaWhereInput,
    include?: PrismaIncludeInput,
  ): Promise<T | null> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    return model.findUnique({
      where,
      include,
    }) as Promise<T | null>;
  }

  async findFirst(
    where: PrismaWhereInput,
    include?: PrismaIncludeInput,
  ): Promise<T | null> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    return model.findFirst({
      where,
      include,
    }) as Promise<T | null>;
  }

  async count(where?: PrismaWhereInput): Promise<number> {
    const model = this.prisma[this.modelName as keyof PrismaService] as any;
    return model.count({
      where,
    }) as Promise<number>;
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
    const model = this.prisma[this.modelName as keyof PrismaService] as any;

    const [data, total] = await Promise.all([
      model.findMany({
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
