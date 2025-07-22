import { Module, OnModuleInit } from '@nestjs/common';
import { RoleService } from './role.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule implements OnModuleInit {
  constructor(private roleService: RoleService) {}

  async onModuleInit() {
    await this.roleService.seedRoles();
  }
}
