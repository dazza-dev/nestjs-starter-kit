import { PrismaMssql } from '@prisma/adapter-mssql';
import { DatabaseConnectionConfig } from '@/config/DatabaseConfig';

export class SqlServerConnection {
  static create(config: DatabaseConnectionConfig) {
    return new PrismaMssql({
      server: config.server!,
      port: config.port!,
      user: config.user!,
      password: config.password!,
      database: config.database!,
      options: {
        encrypt: true, // Required for Azure SQL
        trustServerCertificate: true, // Required with self-signed certificates
      },
    });
  }
}
