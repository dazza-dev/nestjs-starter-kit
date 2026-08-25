export interface StorageDisk {
  put(filePath: string, content: Buffer | string): Promise<string>;
  get(filePath: string): Promise<Buffer | null>;
  exists(filePath: string): Promise<boolean>;
  delete(filePath: string): Promise<boolean>;
  size(filePath: string): Promise<number | null | undefined>;
}

export interface FileOptions {
  mimeType?: string;
}

export interface LocalDiskConfig {
  driver: 'local';
  basePath: string;
}

export interface S3DiskConfig {
  driver: 's3';
  key: string;
  secret: string;
  bucket: string;
  region: string;
}

export type DiskConfig = LocalDiskConfig | S3DiskConfig;
