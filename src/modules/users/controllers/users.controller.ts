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
import { UsersService } from '@/modules/users/services/users.service';
import { UserResource } from '@/modules/users/resources/user.resource';
import { QueryUsersDto } from '@/modules/users/dto/query-users.dto';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @RequirePermissions('read-users')
  async index(@Query() query: QueryUsersDto) {
    const result = await this.usersService.findAll(query);

    return { ...result, data: UserResource.toCollection(result.data) };
  }

  @Get(':uuid')
  @RequirePermissions('read-users')
  async show(@Param('uuid') uuid: string) {
    const user = await this.usersService.findByUuid(uuid);

    return { data: UserResource.toObject(user) };
  }

  @Post()
  @RequirePermissions('create-users')
  @HttpCode(HttpStatus.CREATED)
  async store(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);

    return {
      data: UserResource.toObject(user),
      message: this.i18n.t('users.created'),
    };
  }

  @Put(':uuid')
  @RequirePermissions('update-users')
  async update(@Param('uuid') uuid: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(uuid, dto);

    return {
      data: UserResource.toObject(user),
      message: this.i18n.t('users.updated'),
    };
  }

  @Delete(':uuid')
  @RequirePermissions('delete-users')
  async destroy(@Param('uuid') uuid: string) {
    await this.usersService.remove(uuid);

    return { message: this.i18n.t('users.deleted') };
  }

  @Post(':uuid/restore')
  @RequirePermissions('update-users')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('uuid') uuid: string) {
    const user = await this.usersService.restore(uuid);

    return {
      data: UserResource.toObject(user),
      message: this.i18n.t('users.restored'),
    };
  }
}
