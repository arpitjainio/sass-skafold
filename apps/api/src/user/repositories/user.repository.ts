import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserRepository } from '../../common/interfaces/repository.interface';
import {
  UserWithoutPassword,
  UserWithRoles,
  UserWithSubscriptions,
  PrismaWhereInput,
} from '../../common/types';
import { PasswordUtil } from '../../common/utils/password.util';

interface CreateUserInput {
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  location?: string;
}

type UpdateUserRecordInput = {
  name?: string | null;
  phone?: string | null;
  location?: string | null;
};

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserWithoutPassword | null> {
    return this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async findByEmail(email: string): Promise<UserWithRoles | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      location: user.location,
      notificationPreferences: user.notificationPreferences,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      password: user.password,
      roles: user.roles,
    };
  }

  async findWithRoles(id: string): Promise<UserWithRoles | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      location: user.location,
      notificationPreferences: user.notificationPreferences,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      password: user.password,
      roles: user.roles,
    };
  }

  async findWithSubscriptions(
    id: string,
  ): Promise<UserWithSubscriptions | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        subscriptions: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      location: user.location,
      notificationPreferences: user.notificationPreferences,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles,
      subscriptions: user.subscriptions,
    };
  }

  async create(data: CreateUserInput): Promise<UserWithoutPassword> {
    const createData: {
      email: string;
      name?: string;
      phone?: string;
      location?: string;
      password?: string;
    } = {
      email: data.email,
      name: data.name,
      phone: data.phone,
      location: data.location,
    };

    if (data.password) {
      createData.password = await PasswordUtil.hash(data.password);
    }

    return this.prisma.user.create({
      data: createData,
      omit: { password: true },
    });
  }

  async update(
    id: string,
    data: UpdateUserRecordInput,
  ): Promise<UserWithoutPassword> {
    return this.prisma.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  async delete(id: string): Promise<UserWithoutPassword> {
    return this.prisma.user.delete({
      where: { id },
      omit: { password: true },
    });
  }

  async findMany(where?: PrismaWhereInput): Promise<UserWithoutPassword[]> {
    return this.prisma.user.findMany({
      where,
      omit: { password: true },
    });
  }

  async findUnique(
    where: PrismaWhereInput,
  ): Promise<UserWithoutPassword | null> {
    return this.prisma.user.findUnique({
      where: where as { id: string } | { email: string },
      omit: { password: true },
    });
  }

  async findFirst(
    where: PrismaWhereInput,
  ): Promise<UserWithoutPassword | null> {
    return this.prisma.user.findFirst({
      where,
      omit: { password: true },
    });
  }
}
