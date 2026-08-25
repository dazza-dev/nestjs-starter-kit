interface RoleRow {
  uuid: string;
  name: string;
  displayName: string | null;
  description: string | null;
  deletedAt: Date | null;
}

export class RoleResource {
  static toObject(role: RoleRow) {
    return {
      uuid: role.uuid,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      deletedAt: role.deletedAt,
    };
  }

  static toCollection(roles: RoleRow[]) {
    return roles.map((role) => this.toObject(role));
  }

  /** Reduced shape consumed by the frontend's selects. */
  static toOption(role: RoleRow) {
    return {
      uuid: role.uuid,
      name: role.displayName ?? role.name,
      slug: role.name,
    };
  }
}
