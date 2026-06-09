import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { JwtExpiresIn } from '../config/config.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<JwtExpiresIn>(
            'JWT_EXPIRES_IN',
            '24h' as JwtExpiresIn,
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
