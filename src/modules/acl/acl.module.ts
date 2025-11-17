import { Module } from '@nestjs/common';
import { RolesModule } from '@/modules/acl/roles/roles.module';
import { PermissionsModule } from '@/modules/acl/permissions/permissions.module';

@Module({
  imports: [RolesModule, PermissionsModule],
  exports: [RolesModule, PermissionsModule],
})
export class AclModule {}
