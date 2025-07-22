import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUtil } from '../common/utils/response.util';
import { LoggerService } from '../common/logger/logger.service';
import { SuccessResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private logger: LoggerService,
  ) {}

  async findById(id: string): Promise<SuccessResponse<any>> {
    this.logger.debug('Finding user by ID', 'User', { userId: id });
    
    const user = await this.userRepository.findWithSubscriptions(id);

    if (!user) {
      this.logger.warn('User not found by ID', 'User', { userId: id });
      throw new NotFoundException('User not found');
    }

    this.logger.debug('User found by ID', 'User', { userId: id });
    return ResponseUtil.success(user, 'User retrieved successfully');
  }

  async findByEmail(email: string): Promise<SuccessResponse<any>> {
    this.logger.debug('Finding user by email', 'User', { email });
    
    const user = await this.userRepository.findWithRoles(email);

    if (!user) {
      this.logger.warn('User not found by email', 'User', { email });
      throw new NotFoundException('User not found');
    }

    this.logger.debug('User found by email', 'User', { email });
    return ResponseUtil.success(user, 'User retrieved successfully');
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<SuccessResponse<any>> {
    this.logger.log('Updating user', 'User', { userId: id, updates: updateUserDto });
    
    const user = await this.userRepository.update(id, updateUserDto);

    this.logger.log('User updated successfully', 'User', { userId: id });
    return ResponseUtil.success(user, 'User updated successfully');
  }

  async getUserRoles(id: string): Promise<SuccessResponse<any>> {
    this.logger.debug('Getting user roles', 'User', { userId: id });
    
    const user = await this.userRepository.findWithRoles(id);

    if (!user) {
      this.logger.warn('User not found when getting roles', 'User', { userId: id });
      throw new NotFoundException('User not found');
    }

    const roles = user.roles.map((ur) => ur.role);
    
    this.logger.debug('User roles retrieved', 'User', { 
      userId: id, 
      roleCount: roles.length,
      roles: roles.map(r => r.name),
    });
    
    return ResponseUtil.success(roles, 'User roles retrieved successfully');
  }
}
 