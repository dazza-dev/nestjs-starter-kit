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
import { GroupsService } from '@/modules/configs/services/groups.service';
import { GroupResource } from '@/modules/configs/resources/group.resource';
import { QueryGroupsDto } from '@/modules/configs/dto/query-groups.dto';
import { GroupDto } from '@/modules/configs/dto/group.dto';

@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @RequirePermissions('read-groups')
  async index(@Query() query: QueryGroupsDto) {
    const result = await this.groupsService.findAll(query);

    return { ...result, data: GroupResource.toCollection(result.data) };
  }

  @Get(':uuid')
  @RequirePermissions('read-groups')
  async show(@Param('uuid') uuid: string) {
    const group = await this.groupsService.findByUuid(uuid);

    return { data: GroupResource.toObject(group) };
  }

  @Post()
  @RequirePermissions('create-groups')
  @HttpCode(HttpStatus.CREATED)
  async store(@Body() dto: GroupDto) {
    const group = await this.groupsService.create(dto);

    return {
      data: GroupResource.toObject(group),
      message: this.i18n.t('groups.created'),
    };
  }

  @Put(':uuid')
  @RequirePermissions('update-groups')
  async update(@Param('uuid') uuid: string, @Body() dto: GroupDto) {
    const group = await this.groupsService.update(uuid, dto);

    return {
      data: GroupResource.toObject(group),
      message: this.i18n.t('groups.updated'),
    };
  }

  @Delete(':uuid')
  @RequirePermissions('delete-groups')
  async destroy(@Param('uuid') uuid: string) {
    await this.groupsService.remove(uuid);

    return { message: this.i18n.t('groups.deleted') };
  }

  @Post(':uuid/restore')
  @RequirePermissions('update-groups')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('uuid') uuid: string) {
    const group = await this.groupsService.restore(uuid);

    return {
      data: GroupResource.toObject(group),
      message: this.i18n.t('groups.restored'),
    };
  }
}
