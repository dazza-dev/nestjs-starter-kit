import { Injectable, NotFoundException } from '@nestjs/common';
import type { Role } from '@/modules/acl/roles/types/role.type';
import { CreateRoleDto } from '@/modules/acl/roles/dto/create-role.dto';
import { ListRolesQueryDto } from '@/modules/acl/roles/dto/list-roles.dto';
import { UpdateRoleDto } from '@/modules/acl/roles/dto/update-role.dto';
import { RolesRepository } from '@/modules/acl/roles/repositories/roles.repository';
import type { PaginationResult } from '@/common/prisma/prisma.paginate';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  /**
   * Get all roles with pagination, search, sort, and filter options.
   *
   * @param query - Pagination, search, sort, and filter options.
   * @returns A promise that resolves to an array of roles.
   */
  async getAllPaginated(
    query: ListRolesQueryDto,
  ): Promise<PaginationResult<Role>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return this.rolesRepository.findAllPaginated({
      page,
      limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  /**
   * Get a role by its ID.
   *
   * @param id - The ID of the role to get.
   * @returns A promise that resolves to the role with the given ID.
   * @throws NotFoundException if no role is found with the given ID.
   */
  async getById(id: number): Promise<Role> {
    const role = await this.rolesRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found.');
    }
    return role;
  }

  /**
   * Create a new role.
   *
   * @param data - The data to create the role with.
   * @returns A promise that resolves to the created role.
   */
  async create(data: CreateRoleDto): Promise<Role> {
    return this.rolesRepository.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
    });
  }

  /**
   * Update a role by its ID.
   *
   * @param id - The ID of the role to update.
   * @param data - The data to update the role with.
   * @returns A promise that resolves to the updated role.
   * @throws NotFoundException if no role is found with the given ID.
   */
  async update(id: number, data: UpdateRoleDto): Promise<Role> {
    await this.getById(id);
    return this.rolesRepository.update(id, {
      name: data.name ?? undefined,
      slug: data.slug ?? undefined,
      description: data.description ?? undefined,
    });
  }

  /**
   * Delete a role by its ID.
   *
   * @param id - The ID of the role to delete.
   * @returns A promise that resolves to void.
   * @throws NotFoundException if no role is found with the given ID.
   */
  async delete(id: number): Promise<void> {
    await this.getById(id);
    await this.rolesRepository.delete(id);
  }
}
