import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import type { Request } from 'express';
import type { JwtPayload } from '@/modules/auth/types/auth.type';
import { PERMISSIONS_KEY } from '@/common/decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18n: I18nService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as JwtPayload | undefined;

    // Admin has a full bypass: unchecking a permission must not lock it out of the screen.
    if (user?.isAdmin) {
      return true;
    }

    const userPermissions = new Set(user?.permissions ?? []);

    const hasAll = required.every((p) => userPermissions.has(p));

    if (!hasAll) {
      throw new ForbiddenException(this.i18n.t('auth.forbidden'));
    }

    return true;
  }
}
