import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { RoleModule } from '../role/role.module';
import { AppConfigModule } from '../config/config.module';

@Module({
  imports: [RoleModule, AppConfigModule],
  controllers: [DevController],
})
export class DevModule {}
