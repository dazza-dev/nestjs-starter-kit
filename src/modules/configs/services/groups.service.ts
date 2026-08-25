import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { prismaPaginate } from '@/prisma/prisma.paginate';
import type { QueryGroupsDto } from '@/modules/configs/dto/query-groups.dto';
import type { GroupDto } from '@/modules/configs/dto/group.dto';
import { resolveSort } from '@/common/helpers/sort.helper';

/** Fields allowed for sorting; an unknown key never reaches Prisma. */
const SORTABLE = {
  name: 'name',
  createdAt: 'createdAt',
} as const;

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async findAll(query: QueryGroupsDto) {
    const where: Record<string, unknown> = {
      deletedAt: query.trashed === 'true' ? { not: null } : null,
    };

    if (query.search) {
      where.name = { contains: query.search };
    }

    return prismaPaginate(
      this.prisma.group,
      { where, orderBy: resolveSort(query.sortBy, SORTABLE, 'name') },
      { page: Number(query.page) || 1, perPage: Number(query.perPage) || 15 },
    );
  }

  async options() {
    return this.prisma.group.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findByUuid(uuid: string) {
    const group = await this.prisma.group.findFirst({ where: { uuid } });

    if (!group) {
      throw new NotFoundException(this.i18n.t('groups.not_found'));
    }

    return group;
  }

  async create(dto: GroupDto) {
    return this.prisma.group.create({
      data: { uuid: randomUUID(), name: dto.name, createdAt: new Date() },
    });
  }

  async update(uuid: string, dto: GroupDto) {
    const group = await this.findByUuid(uuid);

    return this.prisma.group.update({
      where: { id: group.id },
      data: { name: dto.name },
    });
  }

  async remove(uuid: string) {
    const group = await this.findByUuid(uuid);

    await this.prisma.group.update({
      where: { id: group.id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(uuid: string) {
    const group = await this.findByUuid(uuid);

    return this.prisma.group.update({
      where: { id: group.id },
      data: { deletedAt: null },
    });
  }
}
