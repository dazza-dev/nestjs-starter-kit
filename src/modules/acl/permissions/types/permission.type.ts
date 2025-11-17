import { Module } from './module.type';

export interface Permission {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface PermissionWithDates extends Permission {
  createdAt: Date;
  updatedAt: Date;
}

export interface ModulePermissionsGroup {
  module: Module;
  permissions: Permission[];
}

export type PermissionResponseCollection = {
  message: string;
  data: ModulePermissionsGroup[];
};
