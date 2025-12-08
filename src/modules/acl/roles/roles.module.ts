import { Module } from '@nestjs/common';
import { RolesController } from '@/modules/acl/roles/controllers/roles.controller';
import { RolesService } from '@/modules/acl/roles/services/roles.service';
import { RolesRepository } from '@/modules/acl/roles/repositories/roles.repository';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
  exports: [RolesService],
})
export class RolesModule {}
