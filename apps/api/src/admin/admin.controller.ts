import {
  Controller,
  Get,
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
import { Prisma, SubscriptionStatus } from '@prisma/client';

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
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    const skip = (page - 1) * limit;

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
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
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
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: SubscriptionStatus,
  ) {
    const skip = (page - 1) * Number(limit);

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
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      success: true,
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
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
}
