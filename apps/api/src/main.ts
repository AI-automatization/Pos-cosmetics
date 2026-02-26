import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppLoggerService } from './common/logger/logger.service';
import { RequestLoggerInterceptor } from './common/interceptors/request-logger.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestContextService } from './common/logger/request-context.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = app.get(AppLoggerService);

  // Use Winston as NestJS logger
  app.useLogger(logger);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3001'),
    credentials: true,
  });

  // Global prefix
  const prefix = config.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(prefix);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptor (Winston-backed request logger)
  const requestContext = app.get(RequestContextService);
  app.useGlobalInterceptors(new RequestLoggerInterceptor(logger, requestContext));

  // Global exception filter (Winston-backed)
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

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

  // Start
  const port = config.get<number>('API_PORT', 3000);
  await app.listen(port);
  logger.log(`RAOS API running on http://localhost:${port}/${prefix}`, 'Bootstrap');
  logger.log(`Swagger docs: http://localhost:${port}/${prefix}/docs`, 'Bootstrap');
}

bootstrap();
