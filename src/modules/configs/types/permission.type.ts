export interface PermissionNode {
  uuid: string;
  name: string;
  label: string;
}

export interface GroupNode {
  group: string;
  label: string;
  permissions: PermissionNode[];
}

export interface ModuleNode {
  module: string | null;
  label: string;
  icon: string | null;
  groups: GroupNode[];
}
