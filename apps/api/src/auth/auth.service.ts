import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/repositories/user.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordUtil } from '../common/utils/password.util';
import { UserWithRoles, AuthResponse } from '../common/types';
import { LoggerService } from '../common/logger/logger.service';
import { RoleService } from '../role/role.service';

@Injectable()
export class AuthService {
  private blacklistedTokens: Set<string> = new Set();

  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private logger: LoggerService,
    private roleService: RoleService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithRoles | null> {
    this.logger.debug('Validating user credentials', 'Auth', { email });

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      this.logger.debug(
        'User not found or has no password during validation',
        'Auth',
        { email },
      );
      return null;
    }

    const isPasswordValid = await PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.debug('User credentials validation failed', 'Auth', {
        email,
      });
      return null;
    }

    this.logger.debug('User credentials validated successfully', 'Auth', {
      email,
    });
    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    this.logger.log('Login attempt', 'Auth', { email: loginDto.email });

    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      this.logger.warn('Failed login attempt - invalid credentials', 'Auth', {
        email: loginDto.email,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log('User logged in successfully', 'Auth', {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((ur) => ur.role.name),
    });

    const authResponse: AuthResponse = {
      accessToken: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        location: user.location,
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
          marketing: false,
        },
        roles: user.roles.map((ur) => ur.role.name),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    return authResponse;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    this.logger.log('Registration attempt', 'Auth', {
      email: registerDto.email,
    });

    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      this.logger.warn('Registration attempt with existing email', 'Auth', {
        email: registerDto.email,
      });
      throw new ConflictException('User already exists');
    }

    // Validate password strength
    const passwordValidation = PasswordUtil.validatePassword(
      registerDto.password,
    );
    if (!passwordValidation.isValid) {
      this.logger.warn('Registration attempt with weak password', 'Auth', {
        email: registerDto.email,
        passwordErrors: passwordValidation.errors,
      });
      throw new ConflictException(
        `Password does not meet requirements: ${passwordValidation.errors.join(
          ', ',
        )}`,
      );
    }

    const user = await this.userRepository.create({
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
    });
    await this.roleService.seedRoles();
    await this.roleService.ensureRoleAssignedByName(user.id, 'user');

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log('User registered successfully', 'Auth', {
      userId: user.id,
      email: user.email,
    });

    const authResponse: AuthResponse = {
      accessToken: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        location: user.location,
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
          marketing: false,
        },
        roles: ['user'],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    return authResponse;
  }

  async logout(token: string, userId: string): Promise<{ message: string }> {
    this.logger.log('Logout attempt', 'Auth', { userId });

    // Add token to blacklist
    this.blacklistedTokens.add(token);

    // Simulate async operation for token blacklisting
    await Promise.resolve();

    this.logger.log('User logged out successfully', 'Auth', { userId });

    return { message: 'Logged out successfully' };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  private cleanupBlacklistedTokens(): void {
    // In a production environment, you might want to implement a more sophisticated
    // token blacklist cleanup mechanism, possibly using Redis with TTL
    if (this.blacklistedTokens.size > 10000) {
      this.logger.warn('Blacklisted tokens cleanup needed', 'Auth', {
        blacklistedCount: this.blacklistedTokens.size,
      });
      this.blacklistedTokens.clear();
    }
  }
}
