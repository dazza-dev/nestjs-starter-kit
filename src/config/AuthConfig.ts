import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwt: {
      secret: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret || secret.length < 32) {
          throw new Error(
            'JWT_SECRET must be defined and at least 32 characters',
          );
        }
        return secret;
      })(),
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
  }),
);
