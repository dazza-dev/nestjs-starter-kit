import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from '@/modules/auth/types/auth.type';
import { IS_PUBLIC_KEY } from '@/modules/auth/decorators/public.decorator';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Allows the request through if the route is public or it carries a valid session.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);

    // On public routes the token is optional, but if valid it identifies the user.
    if (isPublic) {
      if (token) {
        try {
          request['user'] =
            await this.jwtService.verifyAsync<JwtPayload>(token);
        } catch {
          // An expired token doesn't close off a public route.
        }
      }

      return true;
    }

    if (!token) {
      throw new UnauthorizedException(this.i18n.t('auth.token_not_found'));
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(
        this.i18n.t('auth.token_invalid_or_expired'),
      );
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.['AUTH_TOKEN'] as string | undefined;
  }
}
