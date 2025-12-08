import { Module } from '@nestjs/common';
import { RolesController } from '@/modules/acl/roles/controllers/roles.controller';
import { RolesService } from '@/modules/acl/roles/services/roles.service';
import { RolesRepository } from '@/modules/acl/roles/repositories/roles.repository';
import { PrismaService } from '@/common/prisma/prisma.client';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, PrismaService],
  exports: [RolesService],
})
export class RolesModule {}
