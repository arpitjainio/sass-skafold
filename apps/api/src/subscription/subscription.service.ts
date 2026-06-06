import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { AppConfigService } from '../config/config.service';
import { SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionService {
  private stripe?: Stripe;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private configService: AppConfigService,
  ) {}

  private getStripeClient(): Stripe {
    if (this.stripe) {
      return this.stripe;
    }

    const stripeKey = this.configService.stripe.secretKey;
    if (!stripeKey) {
      throw new BadRequestException(
        'Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing features.',
      );
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20',
    });

    this.logger.log('Stripe client initialized', 'Subscription');
    return this.stripe;
  }

  constructWebhookEvent(payload: Buffer, signature?: string): Stripe.Event {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature header');
    }

    const webhookSecret = this.configService.stripe.webhookSecret;
    if (!webhookSecret) {
      throw new BadRequestException(
        'Stripe webhook secret is not configured. Set STRIPE_WEBHOOK_SECRET to process billing webhooks.',
      );
    }

    return this.getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  async findByUserId(userId: string): Promise<unknown[]> {
    this.logger.debug('Finding subscriptions by user ID', 'Subscription', {
      userId,
    });

    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: {
        user: true,
      },
    });

    this.logger.debug('Subscriptions found', 'Subscription', {
      userId,
      count: subscriptions.length,
    });

    return subscriptions;
  }

  async findByStripeId(stripeSubId: string): Promise<unknown> {
    this.logger.debug('Finding subscription by Stripe ID', 'Subscription', {
      stripeSubId,
    });

    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubId },
      include: {
        user: true,
      },
    });

    if (!subscription) {
      this.logger.warn('Subscription not found by Stripe ID', 'Subscription', {
        stripeSubId,
      });
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async createSubscription(
    userId: string,
    priceId: string,
    customerId?: string,
    paymentMethodId?: string,
  ): Promise<unknown> {
    this.logger.log('Creating new subscription', 'Subscription', {
      userId,
      priceId,
      customerId,
      hasPaymentMethod: !!paymentMethodId,
    });

    try {
      const stripe = this.getStripeClient();

      // Get or create Stripe customer
      let stripeCustomerId = customerId;
      if (!stripeCustomerId) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user) {
          this.logger.warn(
            'User not found for subscription creation',
            'Subscription',
            { userId },
          );
          throw new NotFoundException('User not found');
        }

        this.logger.debug('Creating Stripe customer', 'Subscription', {
          userId,
          email: user.email,
        });
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: { userId },
        });

        stripeCustomerId = customer.id;

        // Update user with Stripe customer ID
        await this.prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customer.id },
        });

        this.logger.debug(
          'Stripe customer created and user updated',
          'Subscription',
          {
            userId,
            customerId: customer.id,
          },
        );
      }

      // Create Stripe subscription
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      };

      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId;
      }

      this.logger.debug('Creating Stripe subscription', 'Subscription', {
        customerId: stripeCustomerId,
        priceId,
      });

      const stripeSubscription =
        await stripe.subscriptions.create(subscriptionData);

      // Save to database
      const subscription = await this.prisma.subscription.create({
        data: {
          userId,
          stripeSubId: stripeSubscription.id,
          status: this.mapStripeStatus(stripeSubscription.status),
          currentPeriodEnd: new Date(
            stripeSubscription.current_period_end * 1000,
          ),
        },
        include: {
          user: true,
        },
      });

      this.logger.log('Subscription created successfully', 'Subscription', {
        userId,
        subscriptionId: subscription.id,
        stripeSubscriptionId: stripeSubscription.id,
        status: subscription.status,
      });

      return subscription;
    } catch (error: unknown) {
      this.logger.error(
        'Failed to create subscription',
        error instanceof Error ? error.stack : 'Unknown error',
        'Subscription',
        {
          userId,
          priceId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw new BadRequestException('Failed to create subscription');
    }
  }

  async cancelSubscription(
    userId: string,
    subscriptionId: string,
    cancelAtPeriodEnd = true,
  ): Promise<unknown> {
    this.logger.log('Canceling subscription', 'Subscription', {
      userId,
      subscriptionId,
      cancelAtPeriodEnd,
    });

    try {
      const stripe = this.getStripeClient();

      // Find subscription
      const subscription = await this.prisma.subscription.findFirst({
        where: { id: subscriptionId, userId },
      });

      if (!subscription) {
        this.logger.warn(
          'Subscription not found for cancellation',
          'Subscription',
          {
            userId,
            subscriptionId,
          },
        );
        throw new NotFoundException('Subscription not found');
      }

      // Cancel in Stripe
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubId,
        {
          cancel_at_period_end: cancelAtPeriodEnd,
        },
      );

      // Update in database
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: this.mapStripeStatus(stripeSubscription.status),
          canceledAt: cancelAtPeriodEnd ? new Date() : null,
        },
        include: {
          user: true,
        },
      });

      this.logger.log('Subscription canceled successfully', 'Subscription', {
        userId,
        subscriptionId,
        cancelAtPeriodEnd,
        status: updatedSubscription.status,
      });

      return updatedSubscription;
    } catch (error: unknown) {
      this.logger.error(
        'Failed to cancel subscription',
        error instanceof Error ? error.stack : 'Unknown error',
        'Subscription',
        {
          userId,
          subscriptionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  async updateSubscription(
    userId: string,
    subscriptionId: string,
    priceId: string,
  ): Promise<unknown> {
    this.logger.log('Updating subscription', 'Subscription', {
      userId,
      subscriptionId,
      priceId,
    });

    try {
      const stripe = this.getStripeClient();

      // Find subscription
      const subscription = await this.prisma.subscription.findFirst({
        where: { id: subscriptionId, userId },
      });

      if (!subscription) {
        this.logger.warn('Subscription not found for update', 'Subscription', {
          userId,
          subscriptionId,
        });
        throw new NotFoundException('Subscription not found');
      }

      // Update in Stripe
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubId,
        {
          items: [{ id: subscription.stripeSubId, price: priceId }],
        },
      );

      // Update in database
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: this.mapStripeStatus(stripeSubscription.status),
        },
        include: {
          user: true,
        },
      });

      this.logger.log('Subscription updated successfully', 'Subscription', {
        userId,
        subscriptionId,
        priceId,
        status: updatedSubscription.status,
      });

      return updatedSubscription;
    } catch (error: unknown) {
      this.logger.error(
        'Failed to update subscription',
        error instanceof Error ? error.stack : 'Unknown error',
        'Subscription',
        {
          userId,
          subscriptionId,
          priceId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw new BadRequestException('Failed to update subscription');
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    this.logger.log('Processing webhook event', 'Subscription', {
      type: event.type,
      id: event.id,
    });

    try {
      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionEvent(event.data.object);
          break;
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed':
          await this.handleInvoiceEvent(event.data.object);
          break;
        default:
          this.logger.debug('Unhandled webhook event type', 'Subscription', {
            type: event.type,
          });
      }
    } catch (error: unknown) {
      this.logger.error(
        'Webhook processing failed',
        error instanceof Error ? error.stack : 'Unknown error',
        'Subscription',
        {
          eventType: event.type,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw error;
    }
  }

  private async handleSubscriptionEvent(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    this.logger.log('Handling subscription event', 'Subscription', {
      subscriptionId: subscription.id,
      status: subscription.status,
    });

    await this.prisma.subscription.update({
      where: { stripeSubId: subscription.id },
      data: {
        status: this.mapStripeStatus(subscription.status),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      },
    });

    this.logger.log('Subscription updated from webhook', 'Subscription', {
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  }

  private async handleInvoiceEvent(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log('Handling invoice event', 'Subscription', {
      invoiceId: invoice.id,
      status: invoice.status,
    });

    // Handle invoice events as needed
    // This could include updating subscription status, sending notifications, etc.
    await Promise.resolve(); // Simulate async operation

    this.logger.log('Invoice processed from webhook', 'Subscription', {
      invoiceId: invoice.id,
      status: invoice.status,
    });
  }

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      case 'incomplete':
        return SubscriptionStatus.INCOMPLETE;
      case 'incomplete_expired':
        return SubscriptionStatus.INCOMPLETE_EXPIRED;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      case 'unpaid':
        return SubscriptionStatus.UNPAID;
      default:
        return SubscriptionStatus.INCOMPLETE;
    }
  }

  async createBillingPortalSession(
    userId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    this.logger.log('Creating billing portal session', 'Subscription', {
      userId,
    });

    try {
      const stripe = this.getStripeClient();
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user?.stripeCustomerId) {
        this.logger.warn('No Stripe customer found for user', 'Subscription', {
          userId,
        });
        throw new BadRequestException('No Stripe customer found for user');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: returnUrl,
      });

      this.logger.log('Billing portal session created', 'Subscription', {
        userId,
      });
      return { url: session.url };
    } catch (error: unknown) {
      this.logger.error(
        'Failed to create billing portal session',
        error instanceof Error ? error.stack : 'Unknown error',
        'Subscription',
        {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw new BadRequestException('Failed to create billing portal session');
    }
  }
}
