import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from '@/config/AppConfig';
import { corsConfig } from '@/config/CorsConfig';
import * as path from 'path';
import { existsSync } from 'fs';

// Translations
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';

// Logger
import { LoggerModule } from 'nestjs-pino';

// Modules
import { UsersModule } from '@/modules/users/users.module';
import { AclModule } from '@/modules/acl/acl.module';
//import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, corsConfig],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
        messageKey: 'message',
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: (() => {
          const distPath = path.join(__dirname, '/i18n/');
          const srcPath = path.join(process.cwd(), '/src/i18n/');
          return existsSync(distPath) ? distPath : srcPath;
        })(),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    UsersModule,
    AclModule,
    //AuthModule
  ],
})
export class AppModule {}
