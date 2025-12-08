import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'src/prisma/schema',
  migrations: {
    path: 'src/prisma/migrations',
    seed: 'tsx src/prisma/seeders/DatabaseSeeder.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
