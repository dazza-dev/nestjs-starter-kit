import { Module } from '@nestjs/common';
import { UsersController } from '@/modules/users/controllers/users.controller';
import { UsersService } from '@/modules/users/services/users.service';
import { UsersRepository } from '@/modules/users/repositories/users.repository';
import { PrismaService } from '@/common/prisma/prisma.client';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
