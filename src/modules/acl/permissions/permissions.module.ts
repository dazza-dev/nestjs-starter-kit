import { Module } from '@nestjs/common';
import { PermissionsController } from '@/modules/acl/permissions/controllers/permissions.controller';
import { PermissionsService } from '@/modules/acl/permissions/services/permissions.service';
import { PermissionsRepository } from '@/modules/acl/permissions/repositories/permissions.repository';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository],
  exports: [PermissionsService],
})
export class PermissionsModule {}
