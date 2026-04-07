import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppLoggerService } from './common/logger/logger.service';
import { RequestLoggerInterceptor } from './common/interceptors/request-logger.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestContextService } from './common/logger/request-context.service';
import { SanitizeStringPipe } from './common/pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = app.get(AppLoggerService);

  // Use Winston as NestJS logger
  app.useLogger(logger);

  // Security
  app.use(helmet());
  app.use(cookieParser());
  // T-077: Response compression (gzip/brotli)
  app.use(compression());
  // CORS_ORIGIN can be comma-separated list for multiple origins (Railway + local)
  const corsOriginRaw = config.get<string>(
    'CORS_ORIGIN',
    'http://localhost:3001,http://localhost:3000,http://localhost:3003,http://localhost:3004,https://web-production-5b0b7.up.railway.app',
  );
  // '*' with credentials is rejected by browsers — reflect request origin instead
  const corsOrigin: string | string[] | boolean = corsOriginRaw === '*'
    ? true
    : corsOriginRaw.includes(',')
      ? corsOriginRaw.split(',').map((o) => o.trim())
      : corsOriginRaw;
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Bootstrap-Secret'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const prefix = config.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(prefix);

  // T-072: Sanitize strings BEFORE validation (HTML strip)
  // T-072 + Validation pipeline: sanitize → validate/transform
  app.useGlobalPipes(
    new SanitizeStringPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptor + exception filter (Winston-backed, Prisma-aware)
  const requestContext = app.get(RequestContextService);
  app.useGlobalInterceptors(new RequestLoggerInterceptor(logger, requestContext));
  app.useGlobalFilters(new GlobalExceptionFilter(logger, requestContext));

  // BigInt JSON serialization
  (BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
    return this.toString();
  };

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RAOS API')
    .setDescription('Retail & Asset Operating System API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  // Graceful shutdown (T-085)
  app.enableShutdownHooks();

  // Start — PORT injectится Railway/Docker, API_PORT для локальной разработки
  const port = config.get<number>('PORT') ?? config.get<number>('API_PORT', 3000);
  await app.listen(port);
  logger.log(`RAOS API v1 running on http://localhost:${port}/${prefix}`, 'Bootstrap');
  logger.log(`Swagger docs: http://localhost:${port}/${prefix}/docs`, 'Bootstrap');
}

bootstrap();
