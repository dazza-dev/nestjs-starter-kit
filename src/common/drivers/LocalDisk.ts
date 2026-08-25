import * as fs from 'fs';
import * as path from 'path';
import type { StorageDisk } from '@/common/types/storage.type';

export class LocalDisk implements StorageDisk {
  constructor(private basePath: string) {}

  /**
   * Stores a file on the local disk.
   */
  async put(filePath: string, content: Buffer | string): Promise<string> {
    const fullPath = path.join(this.basePath, filePath);
    const directory = path.dirname(fullPath);

    await fs.promises.mkdir(directory, { recursive: true });
    await fs.promises.writeFile(fullPath, content);

    return fullPath;
  }

  /**
   * Gets the content of a file from the local disk.
   */
  async get(filePath: string): Promise<Buffer | null> {
    const fullPath = path.join(this.basePath, filePath);
    try {
      return await fs.promises.readFile(fullPath);
    } catch {
      return null;
    }
  }

  /**
   * Checks whether a file exists on the local disk.
   */
  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, filePath);
    try {
      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deletes a file from the local disk.
   */
  async delete(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, filePath);
    try {
      await fs.promises.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the size in bytes of a file stored on the local disk.
   */
  async size(filePath: string): Promise<number | null> {
    const fullPath = path.join(this.basePath, filePath);
    try {
      const stat = await fs.promises.stat(fullPath);
      return stat.size;
    } catch {
      return null;
    }
  }
}
