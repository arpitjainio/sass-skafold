import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/types';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.userService.findById(req.user.userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Updated user profile' })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.userId, updateUserDto);
  }

  @Put('me/password')
  @ApiOperation({ summary: 'Update current user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  async updatePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user.userId, changePasswordDto);
  }

  @Put('me/notifications')
  @ApiOperation({ summary: 'Update current user notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Updated user notification preferences',
  })
  async updateNotificationPreferences(
    @Request() req: AuthenticatedRequest,
    @Body()
    updateNotificationPreferencesDto: UpdateNotificationPreferencesDto,
  ) {
    return this.userService.updateNotificationPreferences(
      req.user.userId,
      updateNotificationPreferencesDto,
    );
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get user roles' })
  @ApiResponse({ status: 200, description: 'User roles' })
  async getUserRoles(@Request() req: AuthenticatedRequest) {
    return this.userService.getUserRoles(req.user.userId);
  }

  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Get user dashboard analytics' })
  @ApiResponse({ status: 200, description: 'User dashboard analytics' })
  async getUserDashboardAnalytics(@Request() req: AuthenticatedRequest) {
    return this.userService.getUserDashboardAnalytics(req.user.userId);
  }
}
