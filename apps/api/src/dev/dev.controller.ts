import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoleService } from '../role/role.service';
import { AppConfigService } from '../config/config.service';

@Controller('dev')
@ApiTags('Development')
export class DevController {
  constructor(
    private roleService: RoleService,
    private configService: AppConfigService,
  ) {}

  @Post('setup')
  @ApiOperation({
    summary:
      'Development setup - Seed roles and create admin user (no auth required)',
  })
  @ApiResponse({
    status: 200,
    description: 'Development setup completed successfully',
  })
  async devSetup(@Body() body: { userEmail: string }) {
    // Only allow in development environment
    if (this.configService.isProduction) {
      throw new Error('This endpoint is only available in development mode');
    }

    return this.roleService.devSetup(body.userEmail);
  }
}
