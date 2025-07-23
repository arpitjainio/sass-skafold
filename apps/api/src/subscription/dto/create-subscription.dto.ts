import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Stripe price ID for the subscription',
    example: 'price_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty({
    description:
      'Stripe customer ID (optional, will be created if not provided)',
    example: 'cus_1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({
    description: 'Payment method ID for the subscription',
    example: 'pm_1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}

export class CancelSubscriptionDto {
  @ApiProperty({
    description: 'Stripe subscription ID to cancel',
    example: 'sub_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  subscriptionId: string;

  @ApiProperty({
    description: 'Whether to cancel at period end',
    example: true,
    required: false,
  })
  @IsOptional()
  cancelAtPeriodEnd?: boolean;
}

export class UpdateSubscriptionDto {
  @ApiProperty({
    description: 'New Stripe price ID for the subscription',
    example: 'price_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  priceId: string;
}
