import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

export type JwtExpiresIn = NonNullable<
  NonNullable<JwtModuleOptions['signOptions']>['expiresIn']
>;

export interface AppConfig {
  // Database
  database: {
    url: string;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: JwtExpiresIn;
  };

  // Server
  server: {
    port: number;
    nodeEnv: string;
  };

  // CORS
  cors: {
    origin: string;
  };

  // Stripe (for future use)
  stripe: {
    secretKey?: string;
    webhookSecret?: string;
  };
}

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get database() {
    return {
      url: this.configService.get<string>('DATABASE_URL'),
    };
  }

  get jwt() {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<JwtExpiresIn>(
        'JWT_EXPIRES_IN',
        '24h' as JwtExpiresIn,
      ),
    };
  }

  get server() {
    return {
      port: this.configService.get<number>('PORT', 3001),
      nodeEnv: this.configService.get<string>('NODE_ENV', 'development'),
    };
  }

  get cors() {
    return {
      origin: this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:3000',
      ),
    };
  }

  get stripe() {
    return {
      secretKey: this.configService.get<string>('STRIPE_SECRET_KEY'),
      webhookSecret: this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
    };
  }

  get isDevelopment(): boolean {
    return this.server.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.server.nodeEnv === 'production';
  }

  validate(): void {
    const requiredVars = [
      { key: 'DATABASE_URL', value: this.database.url },
      { key: 'JWT_SECRET', value: this.jwt.secret },
    ];

    const missingVars = requiredVars.filter(({ value }) => !value);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars
          .map(({ key }) => key)
          .join(', ')}`,
      );
    }
  }

  get apiPrefix(): string {
    return this.configService.get<string>('API_PREFIX', 'api');
  }

  get apiVersion(): string {
    return this.configService.get<string>('API_VERSION', 'v1');
  }
}
