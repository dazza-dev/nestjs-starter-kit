import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import type {
  Permission,
  ModulePermissionsGroup,
} from '../types/permission.type';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get permission by id.
   *
   * @param id - Permission id.
   * @returns Permission.
   */
  async findById(id: number): Promise<Permission | null> {
    return this.prisma.permission.findFirst({ where: { id } });
  }

  /**
   * Get all permissions.
   *
   * @returns All permissions.
   */
  async getAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  /**
   * Get all permissions with module.
   *
   * @returns Module permissions group.
   */
  async findGroupedByModule(): Promise<ModulePermissionsGroup[]> {
    const modules = await this.prisma.module.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        order: true,
        permissions: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return modules
      .filter((m) => m.permissions.length > 0)
      .map((m) => ({
        module: m,
        permissions: m.permissions,
      }));
  }
}
