import 'dotenv/config';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '../generated/client';
import { ConnectionFactory } from '../connection.factory';
import { getDatabaseConfig } from '../../config/DatabaseConfig';

const prisma = new PrismaClient({
  adapter: ConnectionFactory.create(getDatabaseConfig()),
});

// First user's credentials; change them before seeding a real environment.
const ADMIN_EMAIL = 'admin@example.test';
const ADMIN_PASSWORD = 'password123';

const read = <T>(file: string): T =>
  JSON.parse(readFileSync(join(__dirname, '..', 'data', file), 'utf8')) as T;

async function seedModules(): Promise<void> {
  const rows =
    read<{ name: string; icon?: string; order?: number }[]>('Modules.json');

  for (const [index, row] of rows.entries()) {
    await prisma.appModule.upsert({
      where: { name: row.name },
      create: {
        uuid: randomUUID(),
        name: row.name,
        icon: row.icon ?? null,
        order: row.order ?? index,
        createdAt: new Date(),
      },
      update: {},
    });
  }
}

async function seedPermissions(): Promise<void> {
  const rows =
    read<{ name: string; group: string; order?: number; module?: string }[]>(
      'Permissions.json',
    );

  for (const [index, row] of rows.entries()) {
    const module = row.module
      ? await prisma.appModule.findUnique({ where: { name: row.module } })
      : null;

    await prisma.permission.upsert({
      where: { name: row.name },
      create: {
        uuid: randomUUID(),
        name: row.name,
        group: row.group,
        order: row.order ?? index,
        moduleId: module?.id ?? null,
        createdAt: new Date(),
      },
      update: {},
    });
  }
}

async function seedRoles(): Promise<void> {
  const rows =
    read<{ name: string; display_name?: string; description?: string }[]>(
      'Roles.json',
    );

  for (const row of rows) {
    await prisma.role.upsert({
      where: { name: row.name },
      create: {
        uuid: randomUUID(),
        name: row.name,
        displayName: row.display_name ?? null,
        description: row.description ?? null,
        createdAt: new Date(),
      },
      update: {},
    });
  }

  // The admin role starts out with every permission checked.
  const admin = await prisma.role.findUnique({ where: { name: 'admin' } });

  if (admin) {
    const permissions = await prisma.permission.findMany({
      select: { id: true },
    });

    await prisma.permissionRole.deleteMany({ where: { roleId: admin.id } });
    await prisma.permissionRole.createMany({
      data: permissions.map((permission) => ({
        roleId: admin.id,
        permissionId: permission.id,
      })),
    });
  }
}

async function seedGroups(): Promise<void> {
  const rows = read<{ name: string }[]>('Groups.json');

  for (const row of rows) {
    const existing = await prisma.group.findFirst({
      where: { name: row.name },
    });

    if (!existing) {
      await prisma.group.create({
        data: { uuid: randomUUID(), name: row.name, createdAt: new Date() },
      });
    }
  }
}

async function seedSettings(): Promise<void> {
  const rows =
    read<{ name: string; type: string; value?: unknown }[]>('Settings.json');

  for (const row of rows) {
    // The column is text: numeric or boolean values from the JSON are serialized.
    const value =
      row.value === null || row.value === undefined
        ? null
        : typeof row.value === 'string'
          ? row.value
          : JSON.stringify(row.value);

    await prisma.setting.upsert({
      where: { name: row.name },
      create: { name: row.name, type: row.type, value, createdAt: new Date() },
      update: {},
    });
  }
}

async function seedAdminUser(): Promise<void> {
  const email = ADMIN_EMAIL;

  if (await prisma.user.findUnique({ where: { email } })) {
    return;
  }

  const user = await prisma.user.create({
    data: {
      uuid: randomUUID(),
      firstName: 'Admin',
      lastName: 'User',
      email,
      username: email,
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      status: 'active',
      createdAt: new Date(),
    },
  });

  const admin = await prisma.role.findUnique({ where: { name: 'admin' } });

  if (admin) {
    await prisma.roleUser.create({
      data: { userId: user.id, roleId: admin.id },
    });
  }
}

async function main(): Promise<void> {
  await seedModules();
  await seedPermissions();
  await seedRoles();
  await seedGroups();
  await seedSettings();
  await seedAdminUser();

  console.log('Seed complete.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
