import { Injectable } from '@nestjs/common';
import { Prisma } from '@/common/prisma/generated/client';
import { prisma } from '@/common/prisma/prisma.client';
import {
  prismaPaginate,
  PaginationResult,
} from '@/common/prisma/prisma.paginate';
import type { Role } from '@/modules/acl/roles/types/role.type';
import { CreateRoleDto } from '@/modules/acl/roles/dto/create-role.dto';
import { UpdateRoleDto } from '@/modules/acl/roles/dto/update-role.dto';

@Injectable()
export class RolesRepository {
  /**
   * Get the query options for finding roles with pagination, search, sort, and filter options.
   *
   * @param options - Pagination, search, sort, and filter options.
   * @returns The query options for finding roles.
   */
  private getQuery(options?: {
    page?: number;
    limit?: number;
    search?: string | null;
    sortBy?: 'name' | 'slug' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): {
    page: number;
    limit: number;
    search?: string | null;
    where: Prisma.RoleWhereInput;
    orderBy?: Prisma.RoleOrderByWithRelationInput;
  } {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;

    const where: Prisma.RoleWhereInput = {
      AND: options?.search
        ? [
            { name: { contains: options.search } },
            { slug: { contains: options.search } },
          ]
        : undefined,
    };

    const orderBy: Prisma.RoleOrderByWithRelationInput | undefined =
      options?.sortBy
        ? { [options.sortBy]: options?.sortOrder ?? 'desc' }
        : undefined;

    return { page, limit, where, orderBy };
  }

  /**
   * Find all roles with pagination, search, sort, and filter options.
   *
   * @param options - Pagination, search, sort, and filter options.
   * @returns A promise that resolves to an array of roles.
   */
  async findAllPaginated(options?: {
    page?: number;
    limit?: number;
    search?: string | null;
    sortBy?: 'name' | 'slug' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    route?: string | null;
  }): Promise<PaginationResult<Role>> {
    const { page, limit, where, orderBy } = this.getQuery(options);

    return prismaPaginate<
      Role,
      {
        where?: Prisma.RoleWhereInput;
        orderBy?: Prisma.RoleOrderByWithRelationInput;
      }
    >(
      prisma.role,
      { where, orderBy },
      { page, limit, route: options?.route ?? null },
    );
  }

  /**
   * Find a role by its ID.
   *
   * @param id - The ID of the role to find.
   * @returns A promise that resolves to the role with the given ID, or null if no role is found.
   */
  async find(id: number): Promise<Role | null> {
    return await prisma.role.findFirst({ where: { id } });
  }

  /**
   * Create a new role.
   *
   * @param data - The data to create the role with.
   * @returns A promise that resolves to the created role.
   */
  async create(data: CreateRoleDto): Promise<Role> {
    return await prisma.role.create({ data });
  }

  /**
   * Update a role by its ID.
   *
   * @param id - The ID of the role to update.
   * @param data - The data to update the role with.
   * @returns A promise that resolves to the updated role.
   */
  async update(id: number, data: UpdateRoleDto): Promise<Role> {
    return await prisma.role.update({ where: { id }, data });
  }

  /**
   * Delete a role by its ID.
   *
   * @param id - The ID of the role to delete.
   * @returns A promise that resolves to the deleted role.
   */
  async delete(id: number): Promise<Role> {
    return await prisma.role.delete({ where: { id } });
  }
}
