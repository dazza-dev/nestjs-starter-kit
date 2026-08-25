import type { UserWithRoles } from '@/modules/users/types/user.type';

export class UserResource {
  static toObject(user: UserWithRoles) {
    return {
      uuid: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
      email: user.email,
      phone: user.phone,
      username: user.username,
      avatar: user.avatar,
      status: user.status,
      roles: user.roles.map((entry) => ({
        uuid: entry.role.uuid,
        name: entry.role.displayName ?? entry.role.name,
        slug: entry.role.name,
      })),
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      deletedAt: user.deletedAt,
    };
  }

  static toCollection(users: UserWithRoles[]) {
    return users.map((user) => this.toObject(user));
  }
}
