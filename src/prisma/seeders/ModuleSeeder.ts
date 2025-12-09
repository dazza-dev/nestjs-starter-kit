import { PrismaService } from '@/prisma/prisma.service';

export default async function ModuleSeeder(prisma: PrismaService) {
  const modules = [
    { name: 'Users', slug: 'users', icon: null, order: 0 },
    { name: 'Roles', slug: 'roles', icon: null, order: 0 },
    { name: 'Permissions', slug: 'permissions', icon: null, order: 0 },
  ];

  for (const mod of modules) {
    const exists = await prisma.module.findFirst({ where: { slug: mod.slug } });
    if (!exists) {
      await prisma.module.create({
        data: {
          name: mod.name,
          slug: mod.slug,
          icon: mod.icon ?? undefined,
          order: mod.order,
        },
      });
    }
  }

  console.log('ModuleSeeder executed');
}
