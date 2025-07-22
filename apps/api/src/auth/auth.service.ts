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
import { ResponseUtil } from '../common/utils/response.util';
import { UserWithRoles, AuthResponse } from '../common/types';
import { LoggerService } from '../common/logger/logger.service';
import { SuccessResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class AuthService {
  private blacklistedTokens: Set<string> = new Set();

  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserWithRoles | null> {
    this.logger.debug('Validating user credentials', 'Auth', { email });
    
    const user = await this.userRepository.findWithRoles(email);

    if (
      user &&
      user.password &&
      (await PasswordUtil.compare(password, user.password))
    ) {
      this.logger.debug('User credentials validated successfully', 'Auth', { userId: user.id });
      return user;
    }
    
    this.logger.debug('User credentials validation failed', 'Auth', { email });
    return null;
  }

  async login(loginDto: LoginDto): Promise<SuccessResponse<AuthResponse>> {
    this.logger.log('Login attempt', 'Auth', { email: loginDto.email });
    
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      this.logger.warn('Failed login attempt - invalid credentials', 'Auth', { email: loginDto.email });
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log('User logged in successfully', 'Auth', { 
      userId: user.id, 
      email: user.email,
      roles: user.roles.map(ur => ur.role.name),
    });
    
    const authResponse: AuthResponse = {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((ur) => ur.role.name),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    return ResponseUtil.success(authResponse, 'Login successful');
  }

  async register(registerDto: RegisterDto): Promise<SuccessResponse<AuthResponse>> {
    this.logger.log('Registration attempt', 'Auth', { email: registerDto.email });

    const existingUser = await this.userRepository.findByEmail(registerDto.email);

    if (existingUser) {
      this.logger.warn('Registration attempt with existing email', 'Auth', { email: registerDto.email });
      throw new ConflictException('User already exists');
    }

    // Validate password strength
    const passwordValidation = PasswordUtil.validatePassword(registerDto.password);
    if (!passwordValidation.isValid) {
      this.logger.warn('Registration attempt with weak password', 'Auth', { 
        email: registerDto.email,
        passwordErrors: passwordValidation.errors,
      });
      throw new ConflictException(
        `Password does not meet requirements: ${passwordValidation.errors.join(', ')}`,
      );
    }

    const user = await this.userRepository.create({
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
    });

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log('User registered successfully', 'Auth', { 
      userId: user.id, 
      email: user.email,
    });
    
    const authResponse: AuthResponse = {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    return ResponseUtil.success(authResponse, 'Registration successful');
  }

  async logout(token: string, userId: string): Promise<SuccessResponse<{ message: string }>> {
    this.logger.log('Logout attempt', 'Auth', { userId });
    
    // Add token to blacklist
    this.blacklistedTokens.add(token);
    
    this.logger.log('User logged out successfully', 'Auth', { userId });
    
    return ResponseUtil.message('Logged out successfully');
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  // Clean up old blacklisted tokens periodically (in production, use Redis)
  private cleanupBlacklistedTokens(): void {
    // This is a simple in-memory cleanup
    // In production, implement proper token blacklisting with Redis
    if (this.blacklistedTokens.size > 10000) {
      this.logger.log('Cleaning up blacklisted tokens', 'Auth', { 
        previousSize: this.blacklistedTokens.size 
      });
      this.blacklistedTokens.clear();
    }
  }
}
 