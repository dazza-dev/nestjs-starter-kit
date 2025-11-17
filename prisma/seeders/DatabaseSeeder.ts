import { PrismaClient } from '@prisma/client';
import UserSeeder from './UserSeeder';
import RoleSeeder from './RoleSeeder';
import ModuleSeeder from './ModuleSeeder';
import PermissionSeeder from './PermissionSeeder';

export default async function DatabaseSeeder(prisma: PrismaClient) {
  console.log('Running ModuleSeeder...');
  await ModuleSeeder(prisma);

  console.log('Running UserSeeder...');
  await UserSeeder(prisma);

  console.log('Running RoleSeeder...');
  await RoleSeeder(prisma);

  console.log('Running PermissionSeeder...');
  await PermissionSeeder(prisma);
}
