import { PrismaService } from '@/prisma/prisma.service';

export default async function PermissionSeeder(prisma: PrismaService) {
  const modules = await prisma.module.findMany();

  const actions = [
    { name: 'Create', slug: 'create' },
    { name: 'Read', slug: 'read' },
    { name: 'Update', slug: 'update' },
    { name: 'Delete', slug: 'delete' },
  ];

  for (const mod of modules) {
    for (const action of actions) {
      const combinedSlug = `${action.slug}-${mod.slug}`;
      const existsCombined = await prisma.permission.findFirst({
        where: { slug: combinedSlug, moduleId: mod.id },
      });
      if (existsCombined) {
        continue;
      }

      const existsOld = await prisma.permission.findFirst({
        where: { slug: action.slug, moduleId: mod.id },
      });

      if (existsOld) {
        await prisma.permission.update({
          where: { id: existsOld.id },
          data: {
            name: `${mod.name} ${action.name}`,
            slug: combinedSlug,
            description: `${action.name} ${mod.name}`,
          },
        });
      } else {
        await prisma.permission.create({
          data: {
            name: `${mod.name} ${action.name}`,
            slug: combinedSlug,
            description: `${action.name} ${mod.name}`,
            moduleId: mod.id,
          },
        });
      }
    }
  }

  console.log('PermissionSeeder executed');
}
