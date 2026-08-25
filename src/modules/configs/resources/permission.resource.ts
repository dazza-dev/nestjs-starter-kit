interface PermissionRow {
  uuid: string;
  name: string;
  group: string;
}

export class PermissionResource {
  static toObject(permission: PermissionRow, label: string) {
    return { uuid: permission.uuid, name: permission.name, label };
  }
}
