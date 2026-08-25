export interface UserRole {
  uuid: string;
  name: string;
  slug: string;
}

export interface AuthenticatedUser {
  uuid: string;
  name: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  username: string | null;
  avatar: string | null;
  roles: UserRole[];
  isAdmin: boolean;
  permissions: string[];
}

export interface UserWithRoles {
  uuid: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  username: string | null;
  avatar: string | null;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date | null;
  deletedAt: Date | null;
  roles: { role: { uuid: string; name: string; displayName: string | null } }[];
}
