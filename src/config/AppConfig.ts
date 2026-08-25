import { registerAs } from '@nestjs/config';

export interface AppConfig {
  name: string;
  env: string;
  port: number;
  frontendUrl: string;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    name: process.env.APP_NAME || '',
    env: process.env.APP_ENV || '',
    port: Number(process.env.APP_PORT ?? 3000),
    frontendUrl: process.env.FRONTEND_URL || '',
  }),
);
