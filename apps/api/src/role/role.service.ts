import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import { LoggerService } from '../common/logger/logger.service';
import { Role } from '../common/types';

@Injectable()
export class RoleService extends BaseService {
  constructor(
    private prisma: PrismaService,
    logger: LoggerService,
  ) {
    super(logger);
  }

  async findAll(): Promise<Role[]> {
    this.logDebug('Finding all roles', 'Role');

    const roles = await this.prisma.role.findMany({
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    this.logDebug('Roles found', 'Role', { count: roles.length });
    return roles;
  }

  async findById(id: string): Promise<Role> {
    this.logDebug('Finding role by ID', 'Role', { roleId: id });

    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    const foundRole = this.handleEntityNotFound(role, 'Role', id, 'Role');
    return foundRole;
  }

  async findByName(name: string): Promise<Role> {
    this.logDebug('Finding role by name', 'Role', { roleName: name });

    const role = await this.prisma.role.findUnique({
      where: { name },
    });

    const foundRole = this.handleEntityNotFound(role, 'Role', name, 'Role');
    return foundRole;
  }

  async create(name: string, description?: string): Promise<Role> {
    this.logOperation('Creating new role', 'Role', { name, description });

    const role = await this.prisma.role.create({
      data: {
        name,
        description,
      },
    });

    this.logOperation('Role created successfully', 'Role', {
      roleId: role.id,
      name,
    });
    return role;
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<any> {
    this.logOperation('Assigning role to user', 'Role', { userId, roleId });

    const userRole = await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        user: true,
        role: true,
      },
    });

    this.logOperation('Role assigned to user successfully', 'Role', {
      userId,
      roleId,
    });
    return userRole;
  }

  async removeRoleFromUser(
    userId: string,
    roleId: string,
  ): Promise<{ deletedCount: number }> {
    this.logOperation('Removing role from user', 'Role', { userId, roleId });

    const result = await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });

    this.logOperation('Role removed from user successfully', 'Role', {
      userId,
      roleId,
      deletedCount: result.count,
    });

    return { deletedCount: result.count };
  }

  async seedRoles(): Promise<{ seededCount: number }> {
    this.logOperation('Seeding default roles', 'Role');

    const defaultRoles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'user', description: 'Regular user' },
      { name: 'premium', description: 'Premium user with additional features' },
    ];

    let seededCount = 0;

    // Use Promise.all for better performance
    await Promise.all(
      defaultRoles.map(async (roleData) => {
        try {
          await this.prisma.role.upsert({
            where: { name: roleData.name },
            update: {},
            create: roleData,
          });
          seededCount++;
        } catch (error) {
          this.logError('Failed to seed role', error as Error, 'Role', {
            roleName: roleData.name,
          });
          throw error;
        }
      }),
    );

    this.logOperation('Roles seeded successfully', 'Role', {
      seededCount,
      totalRoles: defaultRoles.length,
    });
    return { seededCount };
  }

  async getRolesWithUserCount(): Promise<Array<Role & { userCount: number }>> {
    this.logDebug('Getting roles with user count', 'Role');

    const roles = await this.prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    const rolesWithCount = roles.map((role) => ({
      ...role,
      userCount: role._count.users,
      _count: undefined, // Remove the _count property
    }));

    this.logDebug('Roles with user count retrieved', 'Role', {
      count: rolesWithCount.length,
    });
    return rolesWithCount;
  }
}
