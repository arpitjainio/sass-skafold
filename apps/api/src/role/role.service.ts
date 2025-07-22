import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import { LoggerService } from '../common/logger/logger.service';
import { SuccessResponse } from '../common/interfaces/api-response.interface';
import { Role } from '../common/types';

@Injectable()
export class RoleService extends BaseService {
  constructor(
    private prisma: PrismaService,
    logger: LoggerService,
  ) {
    super(logger);
  }

  async findAll(): Promise<SuccessResponse<Role[]>> {
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
    return this.createSuccessResponse(roles, 'Roles retrieved successfully', 'Role');
  }

  async findById(id: string): Promise<SuccessResponse<Role>> {
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
    return this.createSuccessResponse(foundRole, 'Role retrieved successfully', 'Role');
  }

  async findByName(name: string): Promise<SuccessResponse<Role>> {
    this.logDebug('Finding role by name', 'Role', { roleName: name });
    
    const role = await this.prisma.role.findUnique({
      where: { name },
    });

    const foundRole = this.handleEntityNotFound(role, 'Role', name, 'Role');
    return this.createSuccessResponse(foundRole, 'Role retrieved successfully', 'Role');
  }

  async create(name: string, description?: string): Promise<SuccessResponse<Role>> {
    this.logOperation('Creating new role', 'Role', { name, description });
    
    const role = await this.prisma.role.create({
      data: {
        name,
        description,
      },
    });

    this.logOperation('Role created successfully', 'Role', { roleId: role.id, name });
    return this.createSuccessResponse(role, 'Role created successfully', 'Role');
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<SuccessResponse<any>> {
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

    this.logOperation('Role assigned to user successfully', 'Role', { userId, roleId });
    return this.createSuccessResponse(userRole, 'Role assigned successfully', 'Role');
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<SuccessResponse<{ deletedCount: number }>> {
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
      deletedCount: result.count 
    });
    
    return this.createSuccessResponse(
      { deletedCount: result.count }, 
      'Role removed successfully', 
      'Role'
    );
  }

  async seedRoles(): Promise<SuccessResponse<{ seededCount: number }>> {
    this.logOperation('Seeding default roles', 'Role');
    
    const defaultRoles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'user', description: 'Regular user' },
      { name: 'premium', description: 'Premium user with additional features' },
    ];

    let seededCount = 0;
    
    // Use Promise.all for better performance
    const results = await Promise.all(
      defaultRoles.map(async (roleData) => {
        try {
          const result = await this.prisma.role.upsert({
            where: { name: roleData.name },
            update: {},
            create: roleData,
          });
          seededCount++;
          return result;
        } catch (error) {
          this.logError('Failed to seed role', error as Error, 'Role', { roleName: roleData.name });
          throw error;
        }
      })
    );

    this.logOperation('Roles seeded successfully', 'Role', { seededCount, totalRoles: defaultRoles.length });
    return this.createSuccessResponse(
      { seededCount }, 
      'Roles seeded successfully', 
      'Role'
    );
  }

  async getRolesWithUserCount(): Promise<SuccessResponse<Array<Role & { userCount: number }>>> {
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

    const rolesWithCount = roles.map(role => ({
      ...role,
      userCount: role._count.users,
      _count: undefined, // Remove the _count property
    }));

    this.logDebug('Roles with user count retrieved', 'Role', { count: rolesWithCount.length });
    return this.createSuccessResponse(rolesWithCount, 'Roles with user count retrieved successfully', 'Role');
  }
}
