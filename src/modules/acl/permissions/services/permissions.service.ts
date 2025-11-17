import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  Permission,
  ModulePermissionsGroup,
} from '@/modules/acl/permissions/types/permission.type';
import { PermissionsRepository } from '@/modules/acl/permissions/repositories/permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  /**
   * Get all permissions.
   *
   * @returns All permissions.
   */
  async getAll(): Promise<Permission[]> {
    return this.permissionsRepository.getAll();
  }

  /**
   * Get all permissions with module.
   *
   * @returns Module permissions group.
   */
  async getPermissionsWithModule(): Promise<ModulePermissionsGroup[]> {
    return this.permissionsRepository.findGroupedByModule();
  }

  /**
   * Get permission by id.
   *
   * @param id - Permission id.
   * @returns Permission.
   */
  async getById(id: number): Promise<Permission> {
    const permission = await this.permissionsRepository.findById(id);

    // If permission not found, throw not found exception.
    if (!permission) {
      throw new NotFoundException('Permission not found.');
    }

    return permission;
  }
}
