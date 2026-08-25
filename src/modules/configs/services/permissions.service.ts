import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '@/prisma/prisma.service';
import type { ModuleNode } from '@/modules/configs/types/permission.type';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Two-level catalog — module and group; permissions with no module fall into a final block.
   */
  async tree(): Promise<ModuleNode[]> {
    const permissions = await this.prisma.permission.findMany({
      include: { module: true },
      orderBy: [{ group: 'asc' }, { order: 'asc' }, { id: 'asc' }],
    });

    const modules = new Map<string, ModuleNode>();

    for (const permission of permissions) {
      const key = permission.module?.name ?? '';

      if (!modules.has(key)) {
        modules.set(key, {
          module: permission.module?.name ?? null,
          label: this.label('modules', key || 'general'),
          icon: permission.module?.icon ?? null,
          groups: [],
        });
      }

      const node = modules.get(key)!;
      let group = node.groups.find((entry) => entry.group === permission.group);

      if (!group) {
        group = {
          group: permission.group,
          label: this.label('groups', permission.group),
          permissions: [],
        };
        node.groups.push(group);
      }

      group.permissions.push({
        uuid: permission.uuid,
        name: permission.name,
        label: this.label('actions', permission.name),
      });
    }

    const ordered = [...modules.entries()].sort(([a], [b]) => {
      if (a === '') return 1;
      if (b === '') return -1;
      return a.localeCompare(b);
    });

    return ordered.map(([, node]) => node);
  }

  /**
   * UUIDs of the permissions assigned to a role, which is what the frontend consumes.
   */
  async assignedUuids(roleUuid: string): Promise<string[]> {
    const rows = await this.prisma.permission.findMany({
      where: { roles: { some: { role: { uuid: roleUuid } } } },
      select: { uuid: true },
    });

    return rows.map((row) => row.uuid);
  }

  /**
   * Replaces a role's permissions with the received set.
   */
  async syncRolePermissions(roleUuid: string, uuids: string[]): Promise<void> {
    const role = await this.prisma.role.findFirstOrThrow({
      where: { uuid: roleUuid },
    });
    const permissions = await this.prisma.permission.findMany({
      where: { uuid: { in: uuids } },
      select: { id: true },
    });

    await this.prisma.$transaction([
      this.prisma.permissionRole.deleteMany({ where: { roleId: role.id } }),
      this.prisma.permissionRole.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id,
        })),
      }),
    ]);
  }

  /**
   * Translates the key; if there's no translation, returns a readable version.
   */
  private label(bag: string, key: string): string {
    const translated = this.i18n.t(`permissions.${bag}.${key}`);

    if (
      typeof translated === 'string' &&
      !translated.startsWith('permissions.')
    ) {
      return translated;
    }

    return key
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
