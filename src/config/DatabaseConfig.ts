import { registerAs } from '@nestjs/config';

export interface DatabaseConnectionConfig {
  host?: string;
  server?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  connectionLimit?: number;
  url?: string; // For connection strings
}

export interface DatabaseConfig {
  default: string;
  connections: Record<string, DatabaseConnectionConfig>;
}

export const getDatabaseConfig = (): DatabaseConfig => ({
  default: process.env.DB_CONNECTION ?? 'mariadb',
  connections: {
    mariadb: {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT ?? 3306),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    },
    mysql: {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT ?? 3306),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    },
    sqlserver: {
      server: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT ?? 1433),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      url: process.env.DATABASE_URL,
    },
  },
});

export const databaseConfig = registerAs('database', getDatabaseConfig);
