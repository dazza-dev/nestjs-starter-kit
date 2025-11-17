export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RoleResponse = {
  message: string;
  role: Role;
};

export type RoleResponseCollection = {
  message: string;
  roles: Role[];
};
