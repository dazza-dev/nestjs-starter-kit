import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '@/modules/auth/types/auth.type';

/**
 * Extracts the authenticated user from the request.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request['user'] as JwtPayload | undefined;

    if (!user) {
      throw new UnauthorizedException('Unauthenticated user');
    }

    return user;
  },
);
