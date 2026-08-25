import { I18nValidationPipe } from 'nestjs-i18n';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import type { CorsConfig } from '@/config/CorsConfig';
import type { AppConfig } from '@/config/AppConfig';
import { RequestContext } from '@/common/request.context';
import { validationFilter } from '@/common/filters/ValidationFilter';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { setupSentinelBoard } from 'nestjs-sentinel';
import { join } from 'path';
import { Logger } from 'nestjs-pino';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // With 'extended', Express parses the query as qs and supports nested keys (sort_by[0][key]).
  app.set('query parser', 'extended');

  // Security headers; strict CSP since no interactive HTML is served here.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          fontSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: { maxAge: 31536000, includeSubDomains: true },
    }),
  );

  app.use(cookieParser());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    RequestContext.run(req, () => {
      next();
    });
  });

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Validation goes last: in Nest, the last one registered wins.
  app.useGlobalFilters(new HttpExceptionFilter(), validationFilter);

  // The queue panel stays outside the prefix: it's not part of the API.
  app.setGlobalPrefix('api/v1', { exclude: ['sentinel', 'sentinel/*path'] });

  const configService: ConfigService = app.get(ConfigService);
  const cors: CorsConfig | undefined = configService.get<CorsConfig>('cors');

  if (!cors) {
    throw new Error('CORS configuration is not defined');
  }

  app.enableCors({
    origin: cors.allowedOrigins,
    methods: cors.allowedMethods,
    allowedHeaders: cors.allowedHeaders,
    credentials: cors.supportsCredentials,
    maxAge: 86400,
  });

  const appCfg: AppConfig | undefined = configService.get<AppConfig>('app');

  // Public disk: logos and other files whose path isn't secret.
  app.use(
    '/storage',
    express.static(
      process.env.FILESYSTEM_PUBLIC_PATH ??
        join(process.cwd(), 'storage/public'),
    ),
  );

  setupSentinelBoard(app);

  await app.listen(appCfg?.port ?? 3000);
}

void bootstrap();
