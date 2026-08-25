import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { appConfig } from '@/config/AppConfig';
import { corsConfig } from '@/config/CorsConfig';
import { emailConfig } from '@/config/EmailConfig';
import { fileSystemConfig } from '@/config/FileSystemConfig';
import { authConfig, type AuthConfig } from '@/config/AuthConfig';
import throttleConfig from '@/config/ThrottleConfig';
import * as path from 'path';
import { existsSync } from 'fs';
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { ConfigsModule } from '@/modules/configs/configs.module';
import { FilesModule } from '@/modules/files/files.module';
import { SentinelModule } from 'nestjs-sentinel';
import queueConfig from '@/config/QueueConfig';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { SnakeCaseInterceptor } from '@/common/interceptors/snake-case.interceptor';
import { CamelCaseMiddleware } from '@/common/middleware/camel-case.middleware';
import { EmailService } from '@/common/services/email.service';
import { StorageService } from '@/common/services/storage.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [appConfig, authConfig, corsConfig, emailConfig, fileSystemConfig],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => throttleConfig(),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const auth = config.get<AuthConfig>('auth');

        return {
          secret: auth?.jwt.secret,
          signOptions: {
            expiresIn: auth?.jwt.expiresIn as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: {
          transport:
            process.env.APP_ENV === 'production'
              ? undefined
              : { target: 'pino-pretty', options: { colorize: true } },
          messageKey: 'message',
        },
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: (() => {
          const distPath = path.join(__dirname, '../i18n/');
          const srcPath = path.join(__dirname, '/i18n/');

          return existsSync(distPath) ? distPath : srcPath;
        })(),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ConfigsModule,
    FilesModule,
    ScheduleModule.forRoot(),
    SentinelModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => queueConfig(false),
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: SnakeCaseInterceptor },
    EmailService,
    StorageService,
  ],
  exports: [EmailService, StorageService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CamelCaseMiddleware).forRoutes('*');
  }
}
