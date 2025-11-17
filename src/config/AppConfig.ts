import { registerAs } from '@nestjs/config';

export interface AppConfig {
  name: string;
  env: string;
  port: number;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    name: process.env.APP_NAME ?? 'NestJS',
    env: process.env.APP_ENV ?? 'development',
    port: Number(process.env.APP_PORT ?? 3000),
  }),
);
