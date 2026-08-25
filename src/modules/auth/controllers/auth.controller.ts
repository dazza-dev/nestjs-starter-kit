import {
  Body,
  Controller,
  Post,
  Put,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import type { Response } from 'express';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { CurrentUser, RequirePermissions } from '@/common/decorators';
import { AuthService } from '@/modules/auth/services/auth.service';
import { UsersService } from '@/modules/users/services/users.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RequestPasswordResetDto } from '@/modules/auth/dto/request-password-reset.dto';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import { UpdateProfileDto } from '@/modules/auth/dto/update-profile.dto';
import {
  setAuthTokenCookie,
  clearAuthTokenCookie,
} from '@/modules/auth/utils/cookie.util';
import { ProfileResource } from '@/modules/auth/resources/profile.resource';
import type { JwtPayload } from '@/modules/auth/types/auth.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.attemptLogin(
      dto.username,
      dto.password,
    );

    setAuthTokenCookie(res, this.authService.signToken(user));

    return {
      data: ProfileResource.toObject(user),
      message: this.i18n.t('auth.login_success'),
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthTokenCookie(res);

    return { message: this.i18n.t('auth.logout_success') };
  }

  // Reading your own profile needs no permission: it's the session check the SPA starts with.
  @Post('profile')
  @HttpCode(HttpStatus.OK)
  async profile(@CurrentUser() current: JwtPayload) {
    const user = await this.authService.findByUuid(current.sub);

    return { data: ProfileResource.toObject(user) };
  }

  @Put('profile')
  @RequirePermissions('update-profile')
  async updateProfile(
    @CurrentUser() current: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    await this.usersService.updateProfile(current.sub, dto);

    const user = await this.authService.findByUuid(current.sub);

    return {
      data: ProfileResource.toObject(user),
      message: this.i18n.t('auth.profile_updated'),
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: RequestPasswordResetDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sent = await this.authService.sendResetLink(dto.email);

    if (!sent) {
      res.status(HttpStatus.TOO_MANY_REQUESTS);

      return { message: this.i18n.t('auth.reset_throttled') };
    }

    // The response is the same whether or not the account exists, to avoid revealing which emails are registered.
    return { message: this.i18n.t('auth.reset_link_sent') };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.email, dto.token, dto.password);

    return { message: this.i18n.t('auth.reset_success') };
  }
}
