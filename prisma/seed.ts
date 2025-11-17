import { PrismaClient } from '@prisma/client';
import DatabaseSeeder from './seeders/DatabaseSeeder';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Prisma Seeder...');
  await DatabaseSeeder(prisma);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
