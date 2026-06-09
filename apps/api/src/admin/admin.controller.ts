import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Prisma, SubscriptionStatus } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

import { AdminGuard } from '../common/guards/admin.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
@UseGuards(AdminGuard)
@ApiTags('Admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private prisma: PrismaService) {}

  // User Management
  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.roles = {
        some: {
          role: {
            name: role,
          },
        },
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          subscriptions: {
            where: {
              status: 'ACTIVE',
            },
          },
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((ur) => ur.role.name),
        subscriptionCount: user._count.subscriptions,
        hasActiveSubscription: user.subscriptions.length > 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Post('users')
  @ApiOperation({ summary: 'Create user (admin only)' })
  async createUser(
    @Body()
    createData: {
      name: string;
      email: string;
      password: string;
      roles: string[];
    },
  ) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createData.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists',
        errors: ['Email already exists'],
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createData.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: createData.name,
        email: createData.email,
        password: hashedPassword,
      },
    });

    // Add roles
    for (const roleName of createData.roles) {
      const role = await this.prisma.role.findUnique({
        where: { name: roleName },
      });
      if (role) {
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
      }
    }

    // Fetch user with roles
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        subscriptions: {
          include: {
            user: true,
          },
        },
      },
    });

    return {
      data: {
        id: userWithRoles!.id,
        name: userWithRoles!.name,
        email: userWithRoles!.email,
        roles: userWithRoles!.roles.map((ur) => ur.role.name),
        subscriptionCount: userWithRoles!.subscriptions.length,
        hasActiveSubscription: userWithRoles!.subscriptions.length > 0,
        createdAt: userWithRoles!.createdAt,
        updatedAt: userWithRoles!.updatedAt,
      },
      message: 'User created successfully',
    };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  async getUserById(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        subscriptions: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        errors: ['User not found'],
      };
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((ur) => ur.role.name),
        subscriptions: user.subscriptions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user (admin only)' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: { name?: string; email?: string; roles?: string[] },
  ) {
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
      return {
        success: false,
        message: 'User not found',
        errors: ['User not found'],
      };
    }

    // Update user data
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name: updateData.name,
        email: updateData.email,
      },
    });

    // Update roles if provided
    if (updateData.roles) {
      // Remove existing roles
      await this.prisma.userRole.deleteMany({
        where: { userId: id },
      });

      // Add new roles
      for (const roleName of updateData.roles) {
        const role = await this.prisma.role.findUnique({
          where: { name: roleName },
        });
        if (role) {
          await this.prisma.userRole.create({
            data: {
              userId: id,
              roleId: role.id,
            },
          });
        }
      }
    }

    return {
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    };
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (admin only)' })
  async deleteUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        errors: ['User not found'],
      };
    }

    // Delete user (this will cascade to related records)
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  // Subscription Management
  @Get('subscriptions')
  @ApiOperation({ summary: 'Get all subscriptions (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getAllSubscriptions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: SubscriptionStatus,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.SubscriptionWhereInput = {};

    if (status) {
      where.status = status;
    }

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data: subscriptions.map((sub) => ({
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        canceledAt: sub.canceledAt,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        user: sub.user,
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Put('subscriptions/:id')
  @ApiOperation({ summary: 'Update subscription (admin only)' })
  async updateSubscription(
    @Param('id') id: string,
    @Body()
    updateData: {
      status?: SubscriptionStatus;
      currentPeriodEnd?: string;
      canceledAt?: string;
    },
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
        errors: ['Subscription not found'],
      };
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: updateData.status,
        currentPeriodEnd: updateData.currentPeriodEnd
          ? new Date(updateData.currentPeriodEnd)
          : undefined,
        canceledAt: updateData.canceledAt
          ? new Date(updateData.canceledAt)
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedSubscription,
      message: 'Subscription updated successfully',
    };
  }

  @Delete('subscriptions/:id')
  @ApiOperation({ summary: 'Delete subscription (admin only)' })
  async deleteSubscription(@Param('id') id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return {
        success: false,
        message: 'Subscription not found',
        errors: ['Subscription not found'],
      };
    }

    await this.prisma.subscription.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Subscription deleted successfully',
    };
  }

  // Analytics Dashboard
  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics (admin only)' })
  async getDashboardAnalytics() {
    const [
      totalUsers,
      activeSubscriptions,
      totalRevenue,
      userGrowth,
      subscriptionStats,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.subscription.count({
        where: { status: { in: ['ACTIVE', 'TRIALING'] } },
      }),
      this.prisma.user.groupBy({
        by: ['createdAt'],
        _count: true,
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      this.prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        activeSubscriptions,
        totalRevenue,
        userGrowth: userGrowth.length,
        subscriptionStats: subscriptionStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {}),
      },
    };
  }

  @Get('analytics/revenue')
  @ApiOperation({ summary: 'Get revenue analytics (admin only)' })
  async getRevenueAnalytics() {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Group by month for the last 12 months
    const monthlyData = new Array(12).fill(0).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toISOString().slice(0, 7),
        count: 0,
      };
    });

    subscriptions.forEach((sub) => {
      const month = sub.createdAt.toISOString().slice(0, 7);
      const monthIndex = monthlyData.findIndex((m) => m.month === month);
      if (monthIndex !== -1) {
        monthlyData[monthIndex].count++;
      }
    });

    return {
      success: true,
      data: monthlyData.reverse(),
    };
  }

  @Get('analytics/user-growth')
  @ApiOperation({ summary: 'Get user growth analytics (admin only)' })
  async getUserGrowthAnalytics() {
    const users = await this.prisma.user.findMany({
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month for the last 12 months
    const monthlyData = new Array(12).fill(0).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toISOString().slice(0, 7),
        count: 0,
        cumulative: 0,
      };
    });

    let cumulative = 0;
    users.forEach((user) => {
      const month = user.createdAt.toISOString().slice(0, 7);
      const monthIndex = monthlyData.findIndex((m) => m.month === month);
      if (monthIndex !== -1) {
        monthlyData[monthIndex].count++;
        cumulative++;
        monthlyData[monthIndex].cumulative = cumulative;
      }
    });

    return {
      success: true,
      data: monthlyData.reverse(),
    };
  }

  @Get('recent/users')
  @ApiOperation({ summary: 'Get recent users (admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentUsers(@Query('limit') limit: string = '5') {
    const limitNum = parseInt(limit, 10);
    const recentUsers = await this.prisma.user.findMany({
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        roles: {
          include: {
            role: true,
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          take: 1,
        },
      },
    });

    return recentUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.subscriptions.length > 0 ? 'Active' : 'Inactive',
      joined: user.createdAt,
      roles: user.roles.map((ur) => ur.role.name),
    }));
  }

  @Get('recent/activity')
  @ApiOperation({ summary: 'Get recent activity (admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentActivity(@Query('limit') limit: string = '10') {
    const limitNum = parseInt(limit, 10);
    const [recentUsers, recentSubscriptions] = await Promise.all([
      this.prisma.user.findMany({
        take: Math.ceil(limitNum / 2),
        orderBy: { createdAt: 'desc' },
        select: {
          name: true,
          email: true,
          createdAt: true,
        },
      }),
      this.prisma.subscription.findMany({
        take: Math.ceil(limitNum / 2),
        orderBy: { createdAt: 'desc' },
        select: {
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const activities = [
      ...recentUsers.map((user) => ({
        action: 'User registered',
        user: user.name,
        time: user.createdAt,
        type: 'user' as const,
      })),
      ...recentSubscriptions.map((sub) => ({
        action:
          sub.status === 'ACTIVE'
            ? 'New subscription'
            : sub.status === 'CANCELED'
              ? 'Subscription cancelled'
              : 'Subscription updated',
        user: sub.user.name,
        time: sub.createdAt,
        type:
          sub.status === 'CANCELED'
            ? ('cancellation' as const)
            : ('subscription' as const),
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limitNum);

    return activities;
  }
}
