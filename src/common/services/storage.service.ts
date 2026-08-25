import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { extname } from 'path';
import { fileSystemConfig } from '@/config/FileSystemConfig';
import { StorageDriverFactory } from '@/common/factories/StorageDriverFactory';
import type { DiskConfig, StorageDisk } from '@/common/types/storage.type';

/**
 * Exposes a storage disk without the code knowing if it's local or S3.
 */
@Injectable()
export class StorageService {
  constructor(
    @Inject(fileSystemConfig.KEY)
    private readonly config: ConfigType<typeof fileSystemConfig>,
  ) {}

  /**
   * Returns a disk by name, or the configured default.
   */
  disk(name?: string): StorageDisk {
    const disk = this.diskConfig(name);

    return StorageDriverFactory.create(disk.driver, disk as DiskConfig);
  }

  /**
   * Stores the file under a random name inside `directory` and returns the relative path.
   */
  async put(
    directory: string,
    file: { originalname: string; buffer: Buffer },
    diskName?: string,
  ): Promise<string> {
    const name = `${randomBytes(16).toString('hex')}${extname(file.originalname)}`;
    const filePath = `${directory}/${name}`;

    await this.disk(diskName).put(filePath, file.buffer);

    return filePath;
  }

  /**
   * A file's URL: direct if the disk is public, through the endpoint if it's private.
   */
  url(filePath: string, diskName?: string): string {
    const disk = this.diskConfig(diskName);
    const base =
      'url' in disk && disk.url ? disk.url : this.config.filesBaseUrl;

    return `${base.replace(/\/$/, '')}/${filePath}`;
  }

  /**
   * The requested disk's configuration, or the default disk's.
   */
  private diskConfig(name?: string) {
    const key = (name ?? this.config.default) as keyof typeof this.config.disks;

    return this.config.disks[key];
  }

  async delete(filePath: string, diskName?: string): Promise<boolean> {
    return this.disk(diskName).delete(filePath);
  }
}
