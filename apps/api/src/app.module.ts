import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { LoggerModule } from './common/logger/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AdminModule } from './admin/admin.module';
import { DevModule } from './dev/dev.module';

const developmentImports =
  process.env.NODE_ENV === 'development' ? [DevModule] : [];

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    SubscriptionModule,
    AdminModule,
    ...developmentImports,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
