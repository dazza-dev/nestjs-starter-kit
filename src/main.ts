import { I18nValidationPipe } from 'nestjs-i18n';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import type { CorsConfig } from '@/config/CorsConfig';
import type { AppConfig } from '@/config/AppConfig';
import { RequestContext } from '@/common/request.context';
import type { Request, Response, NextFunction } from 'express';
import { Logger } from 'nestjs-pino';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use((req: Request, _res: Response, next: NextFunction) => {
    RequestContext.run(req, () => {
      next();
    });
  });

  // Logger
  app.useLogger(app.get(Logger));

  // Global pipes
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  // Set global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // CORS configuration
  const configService: ConfigService = app.get(ConfigService);
  const cors: CorsConfig | undefined = configService.get<CorsConfig>('cors');

  // CORS configuration validation
  if (!cors) {
    throw new Error('CORS configuration is not defined');
  }

  // Enable CORS
  app.enableCors({
    origin: cors.allowedOrigins,
    methods: cors.allowedMethods,
    allowedHeaders: cors.allowedHeaders,
    credentials: cors.supportsCredentials,
  });

  // Start the application
  const appCfg: AppConfig | undefined = configService.get<AppConfig>('app');
  await app.listen(appCfg?.port ?? 3000);
}

void bootstrap();
