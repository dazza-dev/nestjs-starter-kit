import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { RolesService } from '@/modules/acl/roles/services/roles.service';
import { CreateRoleDto } from '@/modules/acl/roles/dto/create-role.dto';
import { UpdateRoleDto } from '@/modules/acl/roles/dto/update-role.dto';
import { ListRolesQueryDto } from '@/modules/acl/roles/dto/list-roles.dto';
import { RoleResource } from '@/modules/acl/roles/resources/role.resource';
import { Role, RoleResponse } from '@/modules/acl/roles/types/role.type';
import { PaginationResult } from '@/prisma/prisma.paginate';
import { RecordDeleteResponse } from '@/common/types/common.type';
import { Query } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get all roles with pagination, search, sort, and filter options.
   *
   * @param query - Pagination, search, sort, and filter options.
   * @returns A promise that resolves to an array of roles.
   */
  @Get()
  async index(
    @Query() query: ListRolesQueryDto,
  ): Promise<PaginationResult<Role> & { message: string }> {
    const result = await this.rolesService.getAllPaginated(query);

    return {
      message: await this.i18n.t('roles.collection_retrieved_successfully'),
      data: RoleResource.toCollection(result.data),
      meta: result.meta,
      links: result.links,
    };
  }

  /**
   * Get a role by its ID.
   *
   * @param id - The ID of the role to get.
   * @returns A promise that resolves to the role with the given ID.
   * @throws NotFoundException if no role is found with the given ID.
   */
  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number): Promise<RoleResponse> {
    const role = await this.rolesService.find(id);

    return {
      message: await this.i18n.t('roles.retrieved_successfully'),
      role: RoleResource.toResource(role),
    };
  }

  /**
   * Create a new role.
   *
   * @param data - The data to create the role with.
   * @returns A promise that resolves to the created role.
   */
  @Post()
  async store(@Body() data: CreateRoleDto): Promise<RoleResponse> {
    const role = await this.rolesService.create(data);

    return {
      message: await this.i18n.t('roles.created_successfully'),
      role: RoleResource.toResource(role),
    };
  }

  /**
   * Update a role by its ID.
   *
   * @param id - The ID of the role to update.
   * @param data - The data to update the role with.
   * @returns A promise that resolves to the updated role.
   * @throws NotFoundException if no role is found with the given ID.
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateRoleDto,
  ): Promise<RoleResponse> {
    const role = await this.rolesService.update(id, data);

    return {
      message: await this.i18n.t('roles.updated_successfully'),
      role: RoleResource.toResource(role),
    };
  }

  /**
   * Delete a role by its ID.
   *
   * @param id - The ID of the role to delete.
   * @returns A promise that resolves to void.
   * @throws NotFoundException if no role is found with the given ID.
   */
  @Delete(':id')
  @HttpCode(204)
  async destroy(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RecordDeleteResponse> {
    await this.rolesService.delete(id);

    return {
      message: await this.i18n.t('roles.deleted_successfully'),
    };
  }
}
