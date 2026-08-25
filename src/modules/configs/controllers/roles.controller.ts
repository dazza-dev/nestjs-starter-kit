import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { RequirePermissions } from '@/common/decorators';
import { RolesService } from '@/modules/configs/services/roles.service';
import { PermissionsService } from '@/modules/configs/services/permissions.service';
import { RoleResource } from '@/modules/configs/resources/role.resource';
import { QueryRolesDto } from '@/modules/configs/dto/query-roles.dto';
import { RoleDto } from '@/modules/configs/dto/role.dto';
import { SyncRolePermissionsDto } from '@/modules/configs/dto/sync-role-permissions.dto';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @RequirePermissions('read-roles')
  async index(@Query() query: QueryRolesDto) {
    const result = await this.rolesService.findAll(query);

    return { ...result, data: RoleResource.toCollection(result.data) };
  }

  @Get(':uuid')
  @RequirePermissions('read-roles')
  async show(@Param('uuid') uuid: string) {
    const role = await this.rolesService.findByUuid(uuid);

    return { data: RoleResource.toObject(role) };
  }

  @Post()
  @RequirePermissions('create-roles')
  @HttpCode(HttpStatus.CREATED)
  async store(@Body() dto: RoleDto) {
    const role = await this.rolesService.create(dto);

    return {
      data: RoleResource.toObject(role),
      message: this.i18n.t('roles.created'),
    };
  }

  @Put(':uuid')
  @RequirePermissions('update-roles')
  async update(@Param('uuid') uuid: string, @Body() dto: RoleDto) {
    const role = await this.rolesService.update(uuid, dto);

    return {
      data: RoleResource.toObject(role),
      message: this.i18n.t('roles.updated'),
    };
  }

  @Delete(':uuid')
  @RequirePermissions('delete-roles')
  async destroy(@Param('uuid') uuid: string) {
    await this.rolesService.remove(uuid);

    return { message: this.i18n.t('roles.deleted') };
  }

  @Post(':uuid/restore')
  @RequirePermissions('update-roles')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('uuid') uuid: string) {
    const role = await this.rolesService.restore(uuid);

    return {
      data: RoleResource.toObject(role),
      message: this.i18n.t('roles.restored'),
    };
  }

  @Get(':uuid/permissions')
  @RequirePermissions('update-roles')
  async permissions(@Param('uuid') uuid: string) {
    return {
      data: await this.permissionsService.tree(),
      assigned: await this.permissionsService.assignedUuids(uuid),
    };
  }

  @Put(':uuid/permissions')
  @RequirePermissions('update-roles')
  async syncPermissions(
    @Param('uuid') uuid: string,
    @Body() dto: SyncRolePermissionsDto,
  ) {
    await this.permissionsService.syncRolePermissions(uuid, dto.permissions);

    return { message: this.i18n.t('roles.permissions_updated') };
  }
}
