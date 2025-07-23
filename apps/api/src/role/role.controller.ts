import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ReadOnly,
  WriteOperation,
  SensitiveOperation,
} from '../common/decorators/interceptors.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiTags('Roles')
@ApiBearerAuth()
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @ReadOnly()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of all roles' })
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @ReadOnly()
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role details' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findById(@Param('id') id: string) {
    return this.roleService.findById(id);
  }

  @Get('name/:name')
  @ReadOnly()
  @ApiOperation({ summary: 'Get role by name' })
  @ApiResponse({ status: 200, description: 'Role details' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findByName(@Param('name') name: string) {
    return this.roleService.findByName(name);
  }

  @Post()
  @SensitiveOperation()
  @ApiOperation({ summary: 'Create new role' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'editor' },
        description: { type: 'string', example: 'Content editor role' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async create(@Body() body: { name: string; description?: string }) {
    return this.roleService.create(body.name, body.description);
  }

  @Post('assign')
  @WriteOperation()
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-id' },
        roleId: { type: 'string', example: 'role-id' },
      },
      required: ['userId', 'roleId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  async assignRoleToUser(@Body() body: { userId: string; roleId: string }) {
    return this.roleService.assignRoleToUser(body.userId, body.roleId);
  }

  @Delete('assign')
  @WriteOperation()
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-id' },
        roleId: { type: 'string', example: 'role-id' },
      },
      required: ['userId', 'roleId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  async removeRoleFromUser(@Body() body: { userId: string; roleId: string }) {
    return this.roleService.removeRoleFromUser(body.userId, body.roleId);
  }

  @Post('seed')
  @SensitiveOperation()
  @ApiOperation({ summary: 'Seed default roles' })
  @ApiResponse({
    status: 200,
    description: 'Default roles seeded successfully',
  })
  async seedRoles() {
    return this.roleService.seedRoles();
  }

  @Get('stats/user-count')
  @ReadOnly()
  @ApiOperation({ summary: 'Get roles with user count' })
  @ApiResponse({ status: 200, description: 'Roles with user count statistics' })
  async getRolesWithUserCount() {
    return this.roleService.getRolesWithUserCount();
  }
}
