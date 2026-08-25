import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/prisma/prisma.service';
import {
  prismaPaginate,
  type PaginationResult,
} from '@/prisma/prisma.paginate';
import type { QueryUsersDto } from '@/modules/users/dto/query-users.dto';
import type { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import type { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import type { UpdateProfileDto } from '@/modules/auth/dto/update-profile.dto';
import type { UserWithRoles } from '@/modules/users/types/user.type';
import { resolveSort } from '@/common/helpers/sort.helper';

const WITH_ROLES = { roles: { include: { role: true } } };

/** Fields allowed for sorting; an unknown key never reaches Prisma. */
const SORTABLE = {
  firstName: 'firstName',
  lastName: 'lastName',
  // The table shows the full name, sorted by first name.
  fullName: 'firstName',
  email: 'email',
  username: 'username',
  status: 'status',
  lastLoginAt: 'lastLoginAt',
  createdAt: 'createdAt',
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Paginated listing with search, role filter and status filter.
   */
  async findAll(
    query: QueryUsersDto,
  ): Promise<PaginationResult<UserWithRoles>> {
    const where: Record<string, unknown> = {
      deletedAt: query.trashed === 'true' ? { not: null } : null,
    };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
        { email: { contains: query.search } },
        { username: { contains: query.search } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.roleUuid) {
      where.roles = { some: { role: { uuid: query.roleUuid } } };
    }

    const orderBy = resolveSort(query.sortBy, SORTABLE, 'firstName');

    return prismaPaginate<UserWithRoles, { where: Record<string, unknown> }>(
      this.prisma.user as never,
      { where, include: WITH_ROLES, orderBy } as never,
      { page: Number(query.page) || 1, perPage: Number(query.perPage) || 15 },
    );
  }

  async findByUuid(uuid: string) {
    const user = await this.prisma.user.findFirst({
      where: { uuid },
      include: WITH_ROLES,
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('users.not_found'));
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    await this.assertUnique(dto.email, dto.username);

    const roleIds = await this.resolveRoleIds(dto.roleUuids);

    const user = await this.prisma.user.create({
      data: {
        uuid: randomUUID(),
        firstName: dto.firstName,
        lastName: dto.lastName ?? null,
        email: dto.email,
        phone: dto.phone ?? null,
        username: dto.username,
        password: await bcrypt.hash(dto.password, 10),
        status: dto.status ?? 'active',
        createdAt: new Date(),
        roles: { create: roleIds.map((roleId) => ({ roleId })) },
      },
      include: WITH_ROLES,
    });

    return user;
  }

  async update(uuid: string, dto: UpdateUserDto) {
    const user = await this.findByUuid(uuid);

    await this.assertUnique(dto.email, dto.username, user.id);

    const data: Record<string, unknown> = {
      firstName: dto.firstName,
      lastName: dto.lastName ?? null,
      email: dto.email,
      phone: dto.phone ?? null,
      username: dto.username,
      status: dto.status,
    };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.roleUuids) {
      const roleIds = await this.resolveRoleIds(dto.roleUuids);

      await this.prisma.roleUser.deleteMany({ where: { userId: user.id } });

      data.roles = { create: roleIds.map((roleId) => ({ roleId })) };
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data,
      include: WITH_ROLES,
    });
  }

  /**
   * Updates the fields the user is allowed to change on their own profile.
   */
  async updateProfile(uuid: string, dto: UpdateProfileDto) {
    const user = await this.findByUuid(uuid);

    await this.assertUnique(dto.email, dto.username, user.id);

    const data: Record<string, unknown> = {};

    for (const field of [
      'firstName',
      'lastName',
      'email',
      'phone',
      'username',
    ] as const) {
      if (dto[field] !== undefined) {
        data[field] = dto[field];
      }
    }

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data,
      include: WITH_ROLES,
    });
  }

  async remove(uuid: string) {
    const user = await this.findByUuid(uuid);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(uuid: string) {
    const user = await this.findByUuid(uuid);

    return this.prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: null },
      include: WITH_ROLES,
    });
  }

  /**
   * Translates role uuids to primary keys and fails if any doesn't exist.
   */
  private async resolveRoleIds(uuids: string[] = []): Promise<bigint[]> {
    if (!uuids.length) {
      return [];
    }

    const roles = await this.prisma.role.findMany({
      where: { uuid: { in: uuids }, deletedAt: null },
      select: { id: true, uuid: true },
    });

    const found = new Set(roles.map((role) => role.uuid));
    const invalid = uuids
      .map((uuid, index) => (found.has(uuid) ? null : index))
      .filter((index): index is number => index !== null);

    if (invalid.length) {
      const message = this.i18n.t('validation.role_uuids.exists');

      // Indexed by item: role_uuids.0, role_uuids.1... flag which uuid fails.
      throw new UnprocessableEntityException({
        message,
        errors: Object.fromEntries(
          invalid.map((index) => [`role_uuids.${index}`, [message]]),
        ),
      });
    }

    return roles.map((role) => role.id);
  }

  /** Builds a 422 with the error detail by field. */
  private fieldError(
    field: string,
    message: string,
  ): UnprocessableEntityException {
    return new UnprocessableEntityException({
      message,
      errors: { [field]: [message] },
    });
  }

  private async assertUnique(
    email?: string,
    username?: string,
    exceptId?: bigint,
  ): Promise<void> {
    const clashes = await this.prisma.user.findMany({
      where: {
        OR: [
          email ? { email } : undefined,
          username ? { username } : undefined,
        ].filter(Boolean) as object[],
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { email: true, username: true },
    });

    if (clashes.some((row) => email && row.email === email)) {
      throw this.fieldError('email', this.i18n.t('users.email_taken'));
    }

    if (clashes.some((row) => username && row.username === username)) {
      throw this.fieldError('username', this.i18n.t('users.username_taken'));
    }
  }
}
