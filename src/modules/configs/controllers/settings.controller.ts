import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { I18nService } from 'nestjs-i18n';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { OptionalUser, RequirePermissions } from '@/common/decorators';
import { SettingsService } from '@/modules/configs/services/settings.service';
import { RolesService } from '@/modules/configs/services/roles.service';
import { GroupsService } from '@/modules/configs/services/groups.service';
import { RoleResource } from '@/modules/configs/resources/role.resource';
import { GroupResource } from '@/modules/configs/resources/group.resource';
import { UpdateSettingsDto } from '@/modules/configs/dto/update-settings.dto';
import type { JwtPayload } from '@/modules/auth/types/auth.type';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly rolesService: RolesService,
    private readonly groupsService: GroupsService,
    private readonly i18n: I18nService,
  ) {}

  // Public: the SPA queries it before authenticating to render logo, name and theme.
  @Public()
  @Get()
  async index(@OptionalUser() current?: JwtPayload) {
    return {
      data: await this.settingsService.all(Boolean(current)),
      message: this.i18n.t('settings.retrieved'),
    };
  }

  @Put()
  @RequirePermissions('update-config')
  async update(@Body() dto: UpdateSettingsDto) {
    await this.settingsService.update(dto.settings);

    return {
      data: await this.settingsService.all(),
      message: this.i18n.t('settings.updated'),
    };
  }

  @Post('upload-logo')
  @RequirePermissions('update-config')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile() file: { originalname: string; buffer: Buffer },
    @Body('type') type?: string,
  ) {
    const url = await this.settingsService.uploadLogo(file, type);

    return { url, message: this.i18n.t('settings.logo_uploaded') };
  }

  @Get('roles')
  async roles() {
    const roles = await this.rolesService.options();

    return { data: roles.map((role) => RoleResource.toOption(role)) };
  }

  @Get('groups')
  async groups() {
    const groups = await this.groupsService.options();

    return { data: groups.map((group) => GroupResource.toOption(group)) };
  }
}
