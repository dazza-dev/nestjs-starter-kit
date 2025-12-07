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
import { UsersService } from '@/modules/users/services/users.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { ListUsersQueryDto } from '@/modules/users/dto/list-users.dto';
import { UserResource } from '@/modules/users/resources/user.resource';
import { User, UserResponse } from '@/modules/users/types/user.type';
import { RecordDeleteResponse } from '@/common/types/common.type';
import { Query } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginationResult } from '@/common/prisma/prisma.paginate';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Retrieves a collection of users based on the provided query parameters.
   *
   * @param query - The query parameters for filtering and pagination.
   * @returns A promise that resolves to an array of user responses.
   */
  @Get()
  async index(
    @Query() query: ListUsersQueryDto,
  ): Promise<PaginationResult<User> & { message: string }> {
    const result = await this.usersService.getAllPaginated(query);

    return {
      message: await this.i18n.t('users.collection_retrieved_successfully'),
      data: UserResource.toCollection(result.data),
      meta: result.meta,
      links: result.links,
    };
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param id - The ID of the user to retrieve.
   * @returns A promise that resolves to the user response.
   */
  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number): Promise<UserResponse> {
    const user = await this.usersService.findOrFail(id);

    return {
      message: await this.i18n.t('users.retrieved_successfully'),
      user: UserResource.toResource(user),
    };
  }

  /**
   * Creates a new user.
   *
   * @param data - The data transfer object containing the user information.
   * @returns A promise that resolves to the created user response.
   */
  @Post()
  async store(@Body() data: CreateUserDto): Promise<UserResponse> {
    const user = await this.usersService.create(data);

    return {
      message: await this.i18n.t('users.created_successfully'),
      user: UserResource.toResource(user),
    };
  }

  /**
   * Updates a user by their ID.
   *
   * @param id - The ID of the user to update.
   * @param data - The data transfer object containing the updated user information.
   * @returns A promise that resolves to the updated user response.
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.usersService.update(id, data);

    return {
      message: await this.i18n.t('users.updated_successfully'),
      user: UserResource.toResource(user),
    };
  }

  /**
   * Deletes a user by their ID.
   *
   * @param id - The ID of the user to delete.
   * @returns A promise that resolves when the user is successfully deleted.
   */
  @Delete(':id')
  @HttpCode(204)
  async destroy(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RecordDeleteResponse> {
    await this.usersService.delete(id);

    return {
      message: await this.i18n.t('users.deleted_successfully'),
    };
  }
}
