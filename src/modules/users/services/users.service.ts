import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@/modules/users/types/user.type';
import type { PaginationResult } from '@/prisma/prisma.paginate';
import bcrypt from 'bcrypt';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { ListUsersQueryDto } from '@/modules/users/dto/list-users.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { UsersRepository } from '@/modules/users/repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Finds all users based on the provided query parameters.
   *
   * @param query - The query parameters for filtering and pagination.
   * @returns A promise that resolves to an array of users.
   */
  async getAllPaginated(
    query: ListUsersQueryDto,
  ): Promise<PaginationResult<User>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return this.usersRepository.findAllPaginated({
      page,
      limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  /**
   * Finds a user by their ID.
   *
   * @param id - The ID of the user to find.
   * @returns A promise that resolves to the user with the specified ID, or null if not found.
   */
  async find(id: number): Promise<User | null> {
    return await this.usersRepository.find(id);
  }

  /**
   * Finds a user by their ID or throws a NotFoundException if not found.
   *
   * @param id - The ID of the user to find.
   * @returns A promise that resolves to the user with the specified ID.
   */
  async findOrFail(id: number): Promise<User> {
    const user = await this.usersRepository.find(id);

    // Check if the user exists
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  /**
   * Finds a user by their email.
   *
   * @param email - The email of the user to find.
   * @returns A promise that resolves to the user with the specified email, or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findByEmail(email);

    // Check if the user exists
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  /**
   * Creates a new user.
   *
   * @param data - The data transfer object containing the user information.
   * @returns A promise that resolves to the created user.
   */
  async create(data: CreateUserDto): Promise<User> {
    await this.validateEmailUniqueness(data.email);

    // Hash the password
    const passwordHashed = await bcrypt.hash(data.password, 10);

    // Create the user
    return this.usersRepository.create({
      name: data.name,
      avatar: data.avatar,
      email: data.email,
      username: data.username,
      password: passwordHashed,
    });
  }

  /**
   * Updates a user by their ID.
   *
   * @param id - The ID of the user to update.
   * @param data - The data transfer object containing the updated user information.
   * @returns A promise that resolves to the updated user.
   */
  async update(id: number, data: UpdateUserDto): Promise<User> {
    const user = await this.findOrFail(id);

    // Check if the email is being changed and if it's already in use
    if (data.email && data.email !== user.email) {
      await this.validateEmailUniqueness(data.email);
    }

    // Check if the password is provided
    let password: string | undefined;
    if (data.password) {
      password = await bcrypt.hash(data.password, 10);
    }

    // Update the user
    return this.usersRepository.update(id, {
      name: data.name ?? undefined,
      avatar: data.avatar ?? undefined,
      email: data.email ?? undefined,
      username: data.username ?? undefined,
      password: password ?? undefined,
    });
  }

  /**
   * Deletes a user by their ID.
   *
   * @param id - The ID of the user to delete.
   * @returns A promise that resolves when the user is successfully deleted.
   */
  async delete(id: number): Promise<void> {
    await this.findOrFail(id);
    await this.usersRepository.delete(id);
  }

  /**
   * Checks if an email is already in use.
   *
   * @param email - The email to check.
   * @returns A promise that resolves when the check is complete.
   * @throws ConflictException if the email is already in use.
   */
  private async validateEmailUniqueness(email: string): Promise<void> {
    const exists = await this.usersRepository.findByEmail(email);

    if (exists) {
      throw new ConflictException('Email already in use.');
    }
  }
}
