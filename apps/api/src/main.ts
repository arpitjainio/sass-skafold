import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/config.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { CachingInterceptor } from './common/interceptors/caching.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get config service and validate environment
  const configService = app.get(AppConfigService);
  const loggerService = app.get(LoggerService);

  configService.validate();

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptors - order matters!
  app.useGlobalInterceptors(
    new RequestLoggingInterceptor(loggerService), // 1. Log incoming requests
    new PerformanceInterceptor(loggerService), // 2. Monitor performance
    new CachingInterceptor(loggerService), // 3. Handle caching
    new ResponseTransformInterceptor(), // 4. Transform responses
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(loggerService));

  // CORS configuration
  app.enableCors({
    origin: configService.cors.origin,
    credentials: true,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('SaaS Skafold API')
    .setDescription(
      'A comprehensive SaaS API with authentication, user management, and subscription handling',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Roles', 'Role management endpoints')
    .addTag('Subscriptions', 'Subscription management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.server.port;
  await app.listen(port);

  loggerService.log(`Application started successfully`, 'Bootstrap', {
    port,
    environment: configService.server.nodeEnv,
    swaggerUrl: `http://localhost:${port}/api/docs`,
  });

  return port;
}

bootstrap()
  .then((port) => {
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  })
  .catch((error) => {
    console.error(`❌ Error starting the application: ${error}`);
    process.exit(1);
  });
