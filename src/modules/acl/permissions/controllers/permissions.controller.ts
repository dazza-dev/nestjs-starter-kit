import { Controller, Get } from '@nestjs/common';
import { PermissionsService } from '@/modules/acl/permissions/services/permissions.service';
import { PermissionResponseCollection } from '@/modules/acl/permissions/types/permission.type';
import { I18nService } from 'nestjs-i18n';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async index(): Promise<PermissionResponseCollection> {
    const permissions =
      await this.permissionsService.getPermissionsWithModule();

    return {
      message: await this.i18n.t(
        'permissions.collection_retrieved_successfully',
      ),
      data: permissions,
    };
  }
}
