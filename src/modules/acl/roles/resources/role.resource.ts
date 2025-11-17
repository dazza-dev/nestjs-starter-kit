import { Role } from '@/modules/acl/roles/types/role.type';

export class RoleResource {
  static toResource(role: Role): Role {
    return {
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  static toCollection(roles: Role[]): Role[] {
    return roles.map((r) => this.toResource(r));
  }
}
