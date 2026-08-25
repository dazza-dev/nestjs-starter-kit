import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '@/modules/auth/types/auth.type';

/**
 * Like CurrentUser, but for public routes: returns undefined if there is no session.
 */
export const OptionalUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return request['user'] as JwtPayload | undefined;
  },
);
