import { InternalServerErrorException } from '@nestjs/common';
import type {
  StorageDisk,
  DiskConfig,
  LocalDiskConfig,
  S3DiskConfig,
} from '@/common/types/storage.type';
import { LocalDisk } from '@/common/drivers/LocalDisk';
import { S3Disk } from '@/common/drivers/S3Disk';

export class StorageDriverFactory {
  /**
   * Creates a storage disk driver from the configured name.
   */
  static create(driver: string, config: DiskConfig): StorageDisk {
    if (driver === 'local') {
      return this.createLocalDisk(config as LocalDiskConfig);
    }

    if (driver === 's3') {
      return this.createS3Disk(config as S3DiskConfig);
    }

    throw new InternalServerErrorException(`Driver ${driver} not supported`);
  }

  /**
   * Creates a local disk driver.
   */
  private static createLocalDisk(config: LocalDiskConfig): LocalDisk {
    if (!config.basePath) {
      throw new InternalServerErrorException('Disk is missing basePath');
    }
    return new LocalDisk(config.basePath);
  }

  /**
   * Creates an S3 disk driver.
   */
  private static createS3Disk(config: S3DiskConfig): S3Disk {
    if (!config.key || !config.secret || !config.bucket || !config.region) {
      throw new InternalServerErrorException(
        'S3 Disk is missing configuration (key, secret, bucket, or region)',
      );
    }
    return new S3Disk(config);
  }
}
