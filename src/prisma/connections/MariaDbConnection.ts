import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { DatabaseConnectionConfig } from '@/config/DatabaseConfig';

export class MariaDbConnection {
  static create(config: DatabaseConnectionConfig) {
    return new PrismaMariaDb({
      host: config.host!,
      user: config.user!,
      password: config.password!,
      database: config.database!,
      port: config.port!,
      connectionLimit: config.connectionLimit,
    });
  }
}
