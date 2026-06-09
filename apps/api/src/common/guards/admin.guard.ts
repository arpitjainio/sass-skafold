import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from '../../common/types';
import { PrismaService } from '../../prisma/prisma.service';

type AdminRequest = Request & {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
};

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const authHeader = request.headers.authorization;

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('No authorization header');
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      const hasAdminRole = user.roles.some(
        (userRole) => userRole.role.name === 'admin',
      );

      if (!hasAdminRole) {
        throw new ForbiddenException('Admin access required');
      }

      // Add user info to request for use in controllers
      request.user = {
        userId: user.id,
        email: user.email,
        roles: user.roles.map((ur) => ur.role.name),
      };

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Invalid token');
    }
  }
}
