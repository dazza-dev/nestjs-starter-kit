import { prisma } from '@/common/prisma/prisma.client';
import UserSeeder from './UserSeeder';
import RoleSeeder from './RoleSeeder';
import ModuleSeeder from './ModuleSeeder';
import PermissionSeeder from './PermissionSeeder';

async function main() {
  console.log('Running ModuleSeeder...');
  await ModuleSeeder();

  console.log('Running UserSeeder...');
  await UserSeeder();

  console.log('Running RoleSeeder...');
  await RoleSeeder();

  console.log('Running PermissionSeeder...');
  await PermissionSeeder();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
