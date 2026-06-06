import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ZzoneModule } from './integrations/zzone/zzone.module';
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

  // Security — Helmet with CSP (T-481: XSS protection)
  // Strict CSP only in production; dev needs permissive CSP for Swagger UI inline scripts
  const strictCsp = config.get<string>('NODE_ENV') === 'production';
  app.use(
    helmet({
      contentSecurityPolicy: strictCsp
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'blob:'],
              fontSrc: ["'self'"],
              connectSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(cookieParser());
  // T-077: Response compression (gzip/brotli)
  app.use(compression());
  // CORS_ORIGIN: comma-separated list. Dev defaults only — production MUST set via env.
  const corsOriginRaw = config.get<string>(
    'CORS_ORIGIN',
    'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004',
  );
  // SECURITY: '*' with credentials is dangerous — block in production
  const isProduction = config.get<string>('NODE_ENV') === 'production';
  if (corsOriginRaw === '*' && isProduction) {
    logger.error('CORS_ORIGIN=* is not allowed in production! Set explicit origins.', 'Security');
  }
  const corsOrigin: string | string[] | boolean = corsOriginRaw === '*'
    ? (isProduction ? false : true)
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

  // Swagger — internal docs disabled in production
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('RAOS API')
      .setDescription('Retail & Asset Operating System API')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      include: [], // all modules
    });
    SwaggerModule.setup(`${prefix}/docs`, app, document);
  }

  // ZZone Swagger — ALWAYS enabled (public partner API docs)
  const zzoneSwaggerConfig = new DocumentBuilder()
    .setTitle('RAOS x ZZone Collaboration API')
    .setDescription('ZZone marketplace integration API — 18 endpoints')
    .setVersion('1.0.0')
    .addApiKey({ type: 'apiKey', name: 'X-Api-Key', in: 'header' }, 'api-key')
    .build();
  const zzoneDocument = SwaggerModule.createDocument(app, zzoneSwaggerConfig, {
    include: [ZzoneModule],
  });
  SwaggerModule.setup(`${prefix}/zzone/docs`, app, zzoneDocument);

  // Graceful shutdown (T-085)
  app.enableShutdownHooks();

  // Start — PORT injectится Railway/Docker, API_PORT для локальной разработки
  const port = config.get<number>('PORT') ?? config.get<number>('API_PORT', 3000);
  await app.listen(port, '0.0.0.0');
  logger.log(`RAOS API v1 running on http://localhost:${port}/${prefix}`, 'Bootstrap');
  if (!isProduction) {
    logger.log(`Swagger docs: http://localhost:${port}/${prefix}/docs`, 'Bootstrap');
  }
}

bootstrap();

