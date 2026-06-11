import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsBoolean()
  @IsOptional()
  push?: boolean;

  @ApiPropertyOptional({ description: 'Enable SMS notifications' })
  @IsBoolean()
  @IsOptional()
  sms?: boolean;

  @ApiPropertyOptional({ description: 'Enable marketing notifications' })
  @IsBoolean()
  @IsOptional()
  marketing?: boolean;
}
