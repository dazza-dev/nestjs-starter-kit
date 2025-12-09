import { PrismaService } from '@/prisma/prisma.service';
import UserSeeder from './UserSeeder';
import RoleSeeder from './RoleSeeder';
import ModuleSeeder from './ModuleSeeder';
import PermissionSeeder from './PermissionSeeder';

const prisma = new PrismaService();

async function main() {
  console.log('Running ModuleSeeder...');
  await ModuleSeeder(prisma);

  console.log('Running UserSeeder...');
  await UserSeeder(prisma);

  console.log('Running RoleSeeder...');
  await RoleSeeder(prisma);

  console.log('Running PermissionSeeder...');
  await PermissionSeeder(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
