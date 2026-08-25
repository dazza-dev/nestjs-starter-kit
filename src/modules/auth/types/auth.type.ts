/**
 * Content of the JWT that travels in the session cookie.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
  permissions: string[];
}
