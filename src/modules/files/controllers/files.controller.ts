import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Readable } from 'stream';
import * as mime from 'mime-types';
import type { Response } from 'express';
import { StorageService } from '@/common/services/storage.service';

const SEGMENT = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*$/;

@Controller('files')
export class FilesController {
  constructor(
    private readonly storage: StorageService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Serves, with a session, a file from the private disk without exposing its real path.
   */
  @Get(':folder/:filename')
  async show(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    // A segment can't start with a dot or be `..`, or it would escape the directory.
    if (!SEGMENT.test(folder) || !SEGMENT.test(filename)) {
      throw new NotFoundException(this.i18n.t('files.not_found'));
    }

    const buffer = await this.storage
      .disk('local')
      .get(`${folder}/${filename}`);

    if (!buffer) {
      throw new NotFoundException(this.i18n.t('files.not_found'));
    }

    res.set({
      'Content-Type': mime.lookup(filename) || 'application/octet-stream',
      'Content-Length': buffer.length.toString(),
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });

    return new StreamableFile(Readable.from(buffer));
  }
}
