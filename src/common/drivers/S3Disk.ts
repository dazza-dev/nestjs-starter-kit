import { InternalServerErrorException } from '@nestjs/common';
import type { StorageDisk, S3DiskConfig } from '@/common/types/storage.type';

type Command = new (input: Record<string, unknown>) => unknown;

interface S3Sdk {
  S3Client: new (options: Record<string, unknown>) => {
    send: (command: unknown) => Promise<Record<string, unknown>>;
  };
  PutObjectCommand: Command;
  GetObjectCommand: Command;
  HeadObjectCommand: Command;
  DeleteObjectCommand: Command;
}

/**
 * S3 disk; requires `pnpm add @aws-sdk/client-s3`.
 */
export class S3Disk implements StorageDisk {
  private client?: {
    send: (command: unknown) => Promise<Record<string, unknown>>;
  };

  constructor(private readonly config: S3DiskConfig) {}

  private async sdk(): Promise<S3Sdk> {
    // The name goes in a variable on purpose, so TypeScript doesn't require the package.
    const moduleName = '@aws-sdk/client-s3';

    try {
      return (await import(moduleName)) as S3Sdk;
    } catch {
      throw new InternalServerErrorException(
        'The s3 driver needs @aws-sdk/client-s3. Install it or use the local disk.',
      );
    }
  }

  private async connect(): Promise<{
    sdk: S3Sdk;
    client: { send: (command: unknown) => Promise<Record<string, unknown>> };
  }> {
    const sdk = await this.sdk();

    this.client ??= new sdk.S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.key,
        secretAccessKey: this.config.secret,
      },
    });

    return { sdk, client: this.client };
  }

  async put(filePath: string, content: Buffer | string): Promise<string> {
    const { sdk, client } = await this.connect();

    await client.send(
      new sdk.PutObjectCommand({
        Bucket: this.config.bucket,
        Key: filePath,
        Body: content,
      }),
    );

    return filePath;
  }

  async get(filePath: string): Promise<Buffer | null> {
    const { sdk, client } = await this.connect();

    try {
      const response = await client.send(
        new sdk.GetObjectCommand({ Bucket: this.config.bucket, Key: filePath }),
      );
      const body = response.Body as
        | { transformToByteArray: () => Promise<Uint8Array> }
        | undefined;
      const bytes = await body?.transformToByteArray();

      return bytes ? Buffer.from(bytes) : null;
    } catch {
      return null;
    }
  }

  async exists(filePath: string): Promise<boolean> {
    const { sdk, client } = await this.connect();

    try {
      await client.send(
        new sdk.HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: filePath,
        }),
      );

      return true;
    } catch {
      return false;
    }
  }

  async delete(filePath: string): Promise<boolean> {
    const { sdk, client } = await this.connect();

    try {
      await client.send(
        new sdk.DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: filePath,
        }),
      );

      return true;
    } catch {
      return false;
    }
  }

  async size(filePath: string): Promise<number | null> {
    const { sdk, client } = await this.connect();

    try {
      const response = await client.send(
        new sdk.HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: filePath,
        }),
      );

      return (response.ContentLength as number | undefined) ?? null;
    } catch {
      return null;
    }
  }
}
