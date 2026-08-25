import { DatabaseConfig } from '@/config/DatabaseConfig';
import { MariaDbConnection } from './connections/MariaDbConnection';
import { SqlServerConnection } from './connections/SqlServerConnection';

/**
 * Creates the Prisma connection adapter based on the configured database.
 */
export class ConnectionFactory {
  /**
   * Creates the connection adapter for the configuration's default database.
   */
  static create(config: DatabaseConfig) {
    const defaultConnection = config.default;
    const connectionConfig = config.connections[defaultConnection];

    if (!connectionConfig) {
      throw new Error(
        `Connection configuration for '${defaultConnection}' not found.`,
      );
    }

    switch (defaultConnection) {
      case 'mariadb':
      case 'mysql':
        return MariaDbConnection.create(connectionConfig);

      case 'sqlserver':
        return SqlServerConnection.create(connectionConfig);

      default:
        throw new Error(
          `Unsupported database connection type: ${defaultConnection}`,
        );
    }
  }
}
