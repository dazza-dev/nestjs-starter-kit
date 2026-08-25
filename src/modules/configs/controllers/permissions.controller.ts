import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators';
import type { JwtPayload } from '@/modules/auth/types/auth.type';

@Controller('permissions')
export class PermissionsController {
  // No permission required: this is what the SPA uses to build its CASL instance.
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return { data: { permissions: user.permissions, isAdmin: user.isAdmin } };
  }
}
