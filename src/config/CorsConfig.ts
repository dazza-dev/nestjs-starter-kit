import { registerAs } from '@nestjs/config';

export interface CorsConfig {
  paths: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  supportsCredentials: boolean;
  allowedOrigins: string[];
}

export const corsConfig = registerAs(
  'cors',
  (): CorsConfig => ({
    paths: ['api/*'],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    supportsCredentials: true,
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:5173',
    ],
  }),
);
