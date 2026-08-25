import { registerAs } from '@nestjs/config';

export interface FileSystemConfig {
  default: string;
  filesBaseUrl?: string;
  disks: {
    local: {
      driver: string;
      basePath: string;
    };
    public: {
      driver: string;
      basePath: string;
      url: string;
    };
    s3: {
      driver: string;
      key: string;
      secret: string;
      bucket: string;
      region: string;
      url?: string;
    };
  };
}

export const fileSystemConfig = registerAs('filesystem', () => {
  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );

  return {
    default: process.env.FILESYSTEM_DISK || 'public',

    // Base of the endpoint that serves the private disk's files.
    filesBaseUrl: process.env.FILES_BASE_URL || `${appUrl}/api/v1/files`,

    disks: {
      // Private: only reachable through the endpoint, with a session.
      local: {
        driver: 'local',
        basePath:
          process.env.FILESYSTEM_LOCAL_PATH || `${process.cwd()}/storage`,
      },

      // Public: served as static, the path is not secret.
      public: {
        driver: 'local',
        basePath:
          process.env.FILESYSTEM_PUBLIC_PATH ||
          `${process.cwd()}/storage/public`,
        url: `${appUrl}/storage`,
      },

      s3: {
        driver: 's3',
        key: process.env.S3_ACCESS_KEY_ID,
        secret: process.env.S3_SECRET_ACCESS_KEY,
        bucket: process.env.S3_BUCKET,
        region: process.env.S3_REGION,
        url: process.env.S3_URL,
      },
    },
  };
});
