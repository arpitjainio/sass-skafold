import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { AppConfigService } from '../config/config.service';
import { ResponseUtil } from '../common/utils/response.util';
import { SubscriptionStatus } from '@prisma/client';
import { SuccessResponse } from '../common/interfaces/api-response.interface';
import { BaseService } from '../common/services/base.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionService extends BaseService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    logger: LoggerService,
    private configService: AppConfigService,
  ) {
    super(logger);
    const stripeKey = this.configService.stripe.secretKey;
    if (!stripeKey) {
      this.logError('STRIPE_SECRET_KEY is not configured', 'STRIPE_SECRET_KEY is not configured', 'Subscription');
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20',
    });
    this.logOperation('Stripe client initialized', 'Subscription');
  }

  async findByUserId(userId: string): Promise<SuccessResponse<any[]>> {
    this.logDebug('Finding subscriptions by user ID', 'Subscription', { userId });
    
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: {
        user: true,
      },
    });

    this.logDebug('Subscriptions found', 'Subscription', { 
      userId, 
      count: subscriptions.length 
    });
    
    return this.createSuccessResponse(subscriptions, 'Subscriptions retrieved successfully', 'Subscription');
  }

  async findByStripeId(stripeSubId: string): Promise<any> {
    this.logDebug('Finding subscription by Stripe ID', 'Subscription', { stripeSubId });
    
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubId },
      include: {
        user: true,
      },
    });

    const foundSubscription = this.handleEntityNotFound(subscription, 'Subscription', stripeSubId, 'Subscription');
    return foundSubscription;
  }

  async createSubscription(
    userId: string,
    priceId: string,
    customerId?: string,
    paymentMethodId?: string,
  ): Promise<SuccessResponse<any>> {
    this.logOperation('Creating new subscription', 'Subscription', { 
      userId, 
      priceId, 
      customerId,
      hasPaymentMethod: !!paymentMethodId,
    });

    try {
      // Get or create Stripe customer
      let stripeCustomerId = customerId;
      if (!stripeCustomerId) {
        const user = await this.prisma.user.findUnique({ 
          where: { id: userId },
        });
        if (!user) {
          this.logWarning('User not found for subscription creation', 'Subscription', { userId });
          throw new NotFoundException('User not found');
        }

        this.logDebug('Creating Stripe customer', 'Subscription', { userId, email: user.email });
        const customer = await this.stripe.customers.create({
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

        this.logDebug('Stripe customer created and user updated', 'Subscription', { 
          userId, 
          customerId: customer.id 
        });
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

      this.logDebug('Creating Stripe subscription', 'Subscription', { 
        customerId: stripeCustomerId, 
        priceId 
      });
      
      const stripeSubscription = await this.stripe.subscriptions.create(subscriptionData);

      // Save to database
      const subscription = await this.prisma.subscription.create({
        data: {
          userId,
          stripeSubId: stripeSubscription.id,
          status: this.mapStripeStatus(stripeSubscription.status),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        },
        include: {
          user: true,
        },
      });

      this.logOperation('Subscription created successfully', 'Subscription', { 
        userId, 
        subscriptionId: subscription.id,
        stripeSubscriptionId: stripeSubscription.id,
        status: subscription.status,
      });
      
      return this.createSuccessResponse(subscription, 'Subscription created successfully', 'Subscription');
    } catch (error) {
      this.logError('Failed to create subscription', error.stack, 'Subscription', { 
        userId, 
        priceId, 
        error: error.message 
      });
      throw new BadRequestException('Failed to create subscription');
    }
  }

  async cancelSubscription(
    userId: string,
    subscriptionId: string,
    cancelAtPeriodEnd = true,
  ): Promise<SuccessResponse<any>> {
    this.logOperation('Canceling subscription', 'Subscription', { 
      userId, 
      subscriptionId, 
      cancelAtPeriodEnd 
    });

    try {
      const subscription = await this.findByStripeId(subscriptionId);
      
      if (subscription.userId !== userId) {
        this.logWarn('Subscription does not belong to user', 'Subscription', { 
          userId, 
          subscriptionId, 
          subscriptionUserId: subscription.userId 
        });
        throw new BadRequestException('Subscription does not belong to user');
      }

      if (cancelAtPeriodEnd) {
        await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        await this.stripe.subscriptions.cancel(subscriptionId);
      }

      const updatedSubscription = await this.prisma.subscription.update({
        where: { stripeSubId: subscriptionId },
        data: {
          status: cancelAtPeriodEnd ? SubscriptionStatus.ACTIVE : SubscriptionStatus.CANCELED,
        },
        include: {
          user: true,
        },
      });

      this.logOperation('Subscription canceled successfully', 'Subscription', { 
        userId, 
        subscriptionId,
        cancelAtPeriodEnd,
        newStatus: updatedSubscription.status,
      });
      
      return this.createSuccessResponse(updatedSubscription, 'Subscription canceled successfully', 'Subscription');
    } catch (error) {
      this.logError('Failed to cancel subscription', error.stack, 'Subscription', { 
        userId, 
        subscriptionId, 
        error: error.message 
      });
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  async updateSubscription(
    userId: string,
    subscriptionId: string,
    priceId: string,
  ): Promise<SuccessResponse<any>> {
    this.logOperation('Updating subscription', 'Subscription', { 
      userId, 
      subscriptionId, 
      priceId 
    });

    try {
      const subscription = await this.findByStripeId(subscriptionId);
      
      if (subscription.userId !== userId) {
        this.logWarn('Subscription does not belong to user', 'Subscription', { 
          userId, 
          subscriptionId, 
          subscriptionUserId: subscription.userId 
        });
        throw new BadRequestException('Subscription does not belong to user');
      }

      // Update Stripe subscription
      const stripeSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'create_prorations',
      });

      const updatedSubscription = await this.prisma.subscription.update({
        where: { stripeSubId: subscriptionId },
        data: {
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        },
        include: {
          user: true,
        },
      });

      this.logOperation('Subscription updated successfully', 'Subscription', { 
        userId, 
        subscriptionId,
        newPriceId: priceId,
      });
      
      return this.createSuccessResponse(updatedSubscription, 'Subscription updated successfully', 'Subscription');
    } catch (error) {
      this.logError('Failed to update subscription', error.stack, 'Subscription', { 
        userId, 
        subscriptionId, 
        error: error.message 
      });
      throw new BadRequestException('Failed to update subscription');
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    this.logOperation('Processing webhook event', 'Subscription', { 
      eventType: event.type, 
      eventId: event.id 
    });

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionEvent(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed':
          await this.handleInvoiceEvent(event.data.object as Stripe.Invoice);
          break;
        default:
          this.logDebug('Unhandled webhook event', 'Subscription', { 
            eventType: event.type, 
            eventId: event.id 
          });
      }
    } catch (error) {
      this.logError('Webhook processing failed', error.stack, 'Subscription', { 
        eventType: event.type, 
        eventId: event.id 
      });
      throw error;
    }
  }

  private async handleSubscriptionEvent(subscription: Stripe.Subscription): Promise<void> {
    this.logDebug('Handling subscription event', 'Subscription', { 
      subscriptionId: subscription.id,
      status: subscription.status,
    });

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { stripeSubId: subscription.id },
    });

    if (existingSubscription) {
      await this.prisma.subscription.update({
        where: { stripeSubId: subscription.id },
        data: {
          status: this.mapStripeStatus(subscription.status),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      
      this.logDebug('Subscription updated from webhook', 'Subscription', { 
        subscriptionId: subscription.id,
        newStatus: this.mapStripeStatus(subscription.status),
      });
    } else {
      // Find user by Stripe customer ID
      const user = await this.prisma.user.findFirst({
        where: { stripeCustomerId: subscription.customer as string },
      });

      if (user) {
        await this.prisma.subscription.create({
          data: {
            userId: user.id,
            stripeSubId: subscription.id,
            status: this.mapStripeStatus(subscription.status),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        
        this.logDebug('Subscription created from webhook', 'Subscription', { 
          subscriptionId: subscription.id,
          userId: user.id,
        });
      }
    }
  }

  private async handleInvoiceEvent(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      this.logDebug('Handling invoice event', 'Subscription', { 
        invoiceId: invoice.id,
        subscriptionId: invoice.subscription as string,
        paid: invoice.paid,
      });

      const subscription = await this.prisma.subscription.findUnique({
        where: { stripeSubId: invoice.subscription as string },
      });

      if (subscription) {
        const status = invoice.paid ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PAST_DUE;
        await this.prisma.subscription.update({
          where: { stripeSubId: invoice.subscription as string },
          data: { status },
        });
        
        this.logDebug('Subscription status updated from invoice', 'Subscription', { 
          subscriptionId: invoice.subscription as string,
          newStatus: status,
          paid: invoice.paid,
        });
      }
    }
  }

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      case 'incomplete':
      case 'incomplete_expired':
        return SubscriptionStatus.INACTIVE;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      default:
        return SubscriptionStatus.INACTIVE;
    }
  }

  async createBillingPortalSession(
    userId: string,
    returnUrl: string,
  ): Promise<SuccessResponse<{ url: string }>> {
    this.logOperation('Creating billing portal session', 'Subscription', { userId });

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user?.stripeCustomerId) {
        this.logWarn('No Stripe customer found for user', 'Subscription', { userId });
        throw new BadRequestException('No Stripe customer found for user');
      }

      const session = await this.stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: returnUrl,
      });

      this.logOperation('Billing portal session created', 'Subscription', { userId });
      return this.createSuccessResponse({ url: session.url }, 'Billing portal session created', 'Subscription');
    } catch (error) {
      this.logError('Failed to create billing portal session', error.stack, 'Subscription', { 
        userId, 
        error: error.message 
      });
      throw new BadRequestException('Failed to create billing portal session');
    }
  }
}
