import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { RolesController } from '@/modules/configs/controllers/roles.controller';
import { GroupsController } from '@/modules/configs/controllers/groups.controller';
import { SettingsController } from '@/modules/configs/controllers/settings.controller';
import { PermissionsController } from '@/modules/configs/controllers/permissions.controller';
import { RolesService } from '@/modules/configs/services/roles.service';
import { GroupsService } from '@/modules/configs/services/groups.service';
import { SettingsService } from '@/modules/configs/services/settings.service';
import { PermissionsService } from '@/modules/configs/services/permissions.service';
import { StorageService } from '@/common/services/storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    RolesController,
    GroupsController,
    SettingsController,
    PermissionsController,
  ],
  providers: [
    RolesService,
    GroupsService,
    SettingsService,
    PermissionsService,
    StorageService,
  ],
  exports: [RolesService, GroupsService, SettingsService, PermissionsService],
})
export class ConfigsModule {}
