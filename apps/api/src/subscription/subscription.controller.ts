import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionDto,
  CancelSubscriptionDto,
  UpdateSubscriptionDto,
} from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LoggerService } from '../common/logger/logger.service';
import {
  ReadOnly,
  WriteOperation,
  SensitiveOperation,
} from '../common/decorators/interceptors.decorator';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiTags('Subscriptions')
@ApiBearerAuth()
export class SubscriptionController {
  constructor(
    private subscriptionService: SubscriptionService,
    private logger: LoggerService,
  ) {}

  @Get()
  @ReadOnly()
  @ApiOperation({ summary: 'Get user subscriptions' })
  @ApiResponse({ status: 200, description: 'User subscriptions' })
  async getUserSubscriptions(@Request() req) {
    this.logger.logSubscription('Getting user subscriptions', req.user.userId);
    return this.subscriptionService.findByUserId(req.user.userId);
  }

  @Post()
  @SensitiveOperation()
  @ApiOperation({ summary: 'Create new subscription' })
  @ApiBody({ type: CreateSubscriptionDto })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  async createSubscription(
    @Request() req,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    this.logger.logSubscription('Creating subscription', req.user.userId);
    return this.subscriptionService.createSubscription(
      req.user.userId,
      createSubscriptionDto.priceId,
      createSubscriptionDto.customerId,
      createSubscriptionDto.paymentMethodId,
    );
  }

  @Put(':id')
  @WriteOperation()
  @ApiOperation({ summary: 'Update subscription' })
  @ApiBody({ type: UpdateSubscriptionDto })
  @ApiResponse({ status: 200, description: 'Subscription updated' })
  async updateSubscription(
    @Request() req,
    @Param('id') subscriptionId: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    this.logger.logSubscription(
      'Updating subscription',
      req.user.userId,
      subscriptionId,
    );
    return this.subscriptionService.updateSubscription(
      req.user.userId,
      subscriptionId,
      updateSubscriptionDto.priceId,
    );
  }

  @Delete(':id')
  @WriteOperation()
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiBody({ type: CancelSubscriptionDto })
  @ApiResponse({ status: 200, description: 'Subscription canceled' })
  async cancelSubscription(
    @Request() req,
    @Param('id') subscriptionId: string,
    @Body() cancelSubscriptionDto: CancelSubscriptionDto,
  ) {
    this.logger.logSubscription(
      'Canceling subscription',
      req.user.userId,
      subscriptionId,
    );
    return this.subscriptionService.cancelSubscription(
      req.user.userId,
      subscriptionId,
      cancelSubscriptionDto.cancelAtPeriodEnd,
    );
  }

  @Post('billing-portal')
  @SensitiveOperation()
  @ApiOperation({ summary: 'Create billing portal session' })
  @ApiResponse({ status: 200, description: 'Billing portal session created' })
  async createBillingPortalSession(
    @Request() req,
    @Body() body: { returnUrl: string },
  ) {
    this.logger.logSubscription(
      'Creating billing portal session',
      req.user.userId,
    );
    return this.subscriptionService.createBillingPortalSession(
      req.user.userId,
      body.returnUrl,
    );
  }

  @Post('webhook')
  @SensitiveOperation()
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    this.logger.logStripe('Processing webhook', undefined, {
      signature: signature?.substring(0, 20),
    });

    try {
      if (!request.rawBody) {
        throw new BadRequestException('No webhook body received');
      }

      const event = JSON.parse(request.rawBody.toString());
      return this.subscriptionService.handleWebhook(event);
    } catch (error) {
      this.logger.error('Webhook processing failed', error.stack, 'Stripe');
      throw error;
    }
  }
}
