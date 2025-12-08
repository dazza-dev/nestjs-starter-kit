import { prisma } from '@/prisma/prisma.client';

export default async function RoleSeeder() {
  const roles = [
    {
      name: 'Admin',
      slug: 'admin',
      description: 'Administrator role',
    },
    {
      name: 'User',
      slug: 'user',
      description: 'Standard user role',
    },
  ];

  for (const role of roles) {
    const exists = await prisma.role.findFirst({ where: { slug: role.slug } });
    if (!exists) {
      await prisma.role.create({ data: role });
    }
  }

  console.log('RoleSeeder executed');
}
