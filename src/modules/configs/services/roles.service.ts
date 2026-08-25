import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { prismaPaginate } from '@/prisma/prisma.paginate';
import { SYSTEM_ROLES } from '@/modules/configs/constants/acl.constants';
import type { QueryRolesDto } from '@/modules/configs/dto/query-roles.dto';
import type { RoleDto } from '@/modules/configs/dto/role.dto';
import { resolveSort } from '@/common/helpers/sort.helper';
import { slug } from '@/common/helpers/slug.helper';

/** Fields allowed for sorting; an unknown key never reaches Prisma. */
const SORTABLE = {
  displayName: 'displayName',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
} as const;

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async findAll(query: QueryRolesDto) {
    const where: Record<string, unknown> = {
      deletedAt: query.trashed === 'true' ? { not: null } : null,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { displayName: { contains: query.search } },
      ];
    }

    return prismaPaginate(
      this.prisma.role,
      { where, orderBy: resolveSort(query.sortBy, SORTABLE, 'displayName') },
      { page: Number(query.page) || 1, perPage: Number(query.perPage) || 15 },
    );
  }

  /** Flat listing for the frontend's selects. */
  async options() {
    return this.prisma.role.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findByUuid(uuid: string) {
    const role = await this.prisma.role.findFirst({ where: { uuid } });

    if (!role) {
      throw new NotFoundException(this.i18n.t('roles.not_found'));
    }

    return role;
  }

  async create(dto: RoleDto) {
    const name = slug(dto.displayName);

    await this.assertNameFree(name);

    return this.prisma.role.create({
      data: {
        uuid: randomUUID(),
        name,
        displayName: dto.displayName,
        description: dto.description ?? null,
        createdAt: new Date(),
      },
    });
  }

  async update(uuid: string, dto: RoleDto) {
    const role = await this.findByUuid(uuid);

    // A system role's slug is untouchable: permissions hang off it.
    const name = SYSTEM_ROLES.includes(role.name)
      ? role.name
      : slug(dto.displayName);

    await this.assertNameFree(name, role.id);

    return this.prisma.role.update({
      where: { id: role.id },
      data: {
        name,
        displayName: dto.displayName,
        description: dto.description ?? null,
      },
    });
  }

  async remove(uuid: string) {
    const role = await this.findByUuid(uuid);

    // System roles hold up access: deleting them would lock everyone out.
    if (SYSTEM_ROLES.includes(role.name)) {
      throw new UnprocessableEntityException(this.i18n.t('roles.system_role'));
    }

    await this.prisma.role.update({
      where: { id: role.id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(uuid: string) {
    const role = await this.findByUuid(uuid);

    return this.prisma.role.update({
      where: { id: role.id },
      data: { deletedAt: null },
    });
  }

  private async assertNameFree(name: string, exceptId?: bigint): Promise<void> {
    const clash = await this.prisma.role.findFirst({
      where: { name, ...(exceptId ? { id: { not: exceptId } } : {}) },
    });

    if (clash) {
      const message = this.i18n.t('roles.name_taken');

      throw new UnprocessableEntityException({
        message,
        errors: { display_name: [message] },
      });
    }
  }
}
