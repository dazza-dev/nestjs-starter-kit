export interface User {
  id: number;
  name: string;
  avatar: string | null;
  email: string;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserResponse = {
  message: string;
  user: User;
};

export type UserResponseCollection = {
  message: string;
  users: User[];
};
