import { User } from '@/modules/users/types/user.type';

export class UserResource {
  static toResource(user: User): User {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toCollection(users: User[]): User[] {
    return users.map((u) => this.toResource(u));
  }
}
