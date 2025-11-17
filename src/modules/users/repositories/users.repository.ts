import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  prismaPaginate,
  PaginationResult,
} from '@/common/prisma/prisma.paginate';
import type { User } from '@/modules/users/types/user.type';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates the query parameters for pagination, search, sort, and filter options.
   *
   * @param options - The pagination, search, sort, and filter options.
   * @returns The query parameters for pagination, search, sort, and filter options.
   */
  private getQuery(options?: {
    page?: number;
    limit?: number;
    search?: string | null;
    sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): {
    page: number;
    limit: number;
    search?: string | null;
    where: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  } {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      AND: options?.search
        ? [
            { name: { contains: options.search } },
            { email: { contains: options.search } },
          ]
        : undefined,
    };

    const orderBy: Prisma.UserOrderByWithRelationInput | undefined =
      options?.sortBy
        ? { [options.sortBy]: options?.sortOrder ?? 'desc' }
        : undefined;

    return { page, limit, where, orderBy };
  }

  /**
   * Finds all users with pagination, search, sort, and filter options.
   *
   * @param options - The pagination, search, sort, and filter options.
   * @returns A promise that resolves to a pagination result containing the users.
   */
  async findAllPaginated(options?: {
    page?: number;
    limit?: number;
    search?: string | null;
    sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    route?: string | null;
  }): Promise<PaginationResult<User>> {
    const { page, limit, where, orderBy } = this.getQuery(options);

    return prismaPaginate<
      User,
      {
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
      }
    >(
      this.prisma.user,
      { where, orderBy },
      { page, limit, route: options?.route ?? null },
    );
  }

  /**
   * Finds a user by their ID.
   *
   * @param id - The ID of the user to find.
   * @returns A promise that resolves to the user with the specified ID, or null if not found.
   */
  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  /**
   * Finds a user by their email.
   *
   * @param email - The email of the user to find.
   * @returns A promise that resolves to the user with the specified email, or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  /**
   * Creates a new user.
   *
   * @param data - The data to create the user with.
   * @returns A promise that resolves to the created user.
   */
  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /**
   * Updates a user by their ID.
   *
   * @param id - The ID of the user to update.
   * @param data - The data to update the user with.
   * @returns A promise that resolves to the updated user.
   */
  async update(id: number, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  /**
   * Soft deletes a user by their ID.
   *
   * @param id - The ID of the user to soft delete.
   * @returns A promise that resolves to the soft deleted user.
   */
  async delete(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
