import { Module } from '@nestjs/common';
import { PermissionsController } from '@/modules/acl/permissions/controllers/permissions.controller';
import { PermissionsService } from '@/modules/acl/permissions/services/permissions.service';
import { PermissionsRepository } from '@/modules/acl/permissions/repositories/permissions.repository';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository, PrismaService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
