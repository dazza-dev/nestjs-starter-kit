import type { AuthenticatedUser } from '@/modules/users/types/user.type';

/**
 * The authenticated user's profile, with the effective permissions the SPA uses to build its CASL.
 */
export class ProfileResource {
  static toObject(user: AuthenticatedUser) {
    return {
      uuid: user.uuid,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      username: user.username,
      avatar: user.avatar,
      roles: user.roles,
      isAdmin: user.isAdmin,
      permissions: user.permissions,
    };
  }
}
