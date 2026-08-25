import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/client';
import { ConnectionFactory } from './connection.factory';
import { getDatabaseConfig } from '@/config/DatabaseConfig';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const config = getDatabaseConfig();
    const adapter = ConnectionFactory.create(config);

    super({ adapter });
  }
}
