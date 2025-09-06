import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoggerService } from '../common/logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private logger: LoggerService,
    private prisma: PrismaService,
  ) {}

  async findById(id: string): Promise<unknown> {
    this.logger.debug('Finding user by ID', 'User', { userId: id });

    const user = await this.userRepository.findWithSubscriptions(id);

    if (!user) {
      this.logger.warn('User not found by ID', 'User', { userId: id });
      throw new NotFoundException('User not found');
    }

    this.logger.debug('User found by ID', 'User', { userId: id });

    // Format response for frontend - return the data directly, the controller wrapper will add success/message
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((ur) => ur.role.name),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<unknown> {
    this.logger.debug('Finding user by email', 'User', { email });

    const user = await this.userRepository.findWithRoles(email);

    if (!user) {
      this.logger.warn('User not found by email', 'User', { email });
      throw new NotFoundException('User not found');
    }

    this.logger.debug('User found by email', 'User', { email });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<unknown> {
    this.logger.log('Updating user', 'User', {
      userId: id,
      updates: updateUserDto,
    });

    const user = await this.userRepository.update(id, updateUserDto);

    this.logger.log('User updated successfully', 'User', { userId: id });
    return user;
  }

  async getUserRoles(id: string): Promise<unknown> {
    this.logger.debug('Getting user roles', 'User', { userId: id });

    const user = await this.userRepository.findWithRoles(id);

    if (!user) {
      this.logger.warn('User not found when getting roles', 'User', {
        userId: id,
      });
      throw new NotFoundException('User not found');
    }

    const roles = user.roles.map((ur) => ur.role);

    this.logger.debug('User roles retrieved', 'User', {
      userId: id,
      roleCount: roles.length,
      roles: roles.map((r) => r.name),
    });

    return roles;
  }

  async getUserDashboardAnalytics(userId: string): Promise<unknown> {
    this.logger.debug('Getting user dashboard analytics', 'User', { userId });

    // Get user's own subscriptions and basic stats
    const user = await this.userRepository.findWithSubscriptions(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [userSubscriptions, activeSubscriptionCount] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({
        where: {
          userId,
          status: 'ACTIVE',
        },
      }),
    ]);

    // For non-admin users, show limited analytics focused on their own data
    return {
      totalUsers: 1, // Just the current user
      activeSubscriptions: activeSubscriptionCount,
      totalRevenue: 0, // Users don't see revenue
      userGrowth: 0, // Users don't see growth
      subscriptionStats: {
        ACTIVE: activeSubscriptionCount,
        INACTIVE: userSubscriptions.length - activeSubscriptionCount,
      },
    };
  }
}
