import { Module } from '@nestjs/common';
import { FilesController } from '@/modules/files/controllers/files.controller';
import { StorageService } from '@/common/services/storage.service';

@Module({
  controllers: [FilesController],
  providers: [StorageService],
})
export class FilesModule {}
