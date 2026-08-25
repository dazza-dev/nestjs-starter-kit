import { Injectable } from '@nestjs/common';
import { StorageService } from '@/common/services/storage.service';
import { PrismaService } from '@/prisma/prisma.service';
import { PUBLIC_SETTINGS } from '@/modules/configs/constants/settings.constants';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Settings as a key-value map already cast to their type: without a session, only public ones go out.
   */
  async all(isAuthenticated = false): Promise<Record<string, unknown>> {
    const rows = await this.prisma.setting.findMany({
      where: isAuthenticated ? {} : { name: { in: PUBLIC_SETTINGS } },
      orderBy: { id: 'asc' },
    });

    return Object.fromEntries(
      rows.map((row) => [row.name, this.cast(row.type, row.value)]),
    );
  }

  /**
   * Saves only settings that already exist: the catalog is closed.
   */
  async update(values: { name: string; value?: unknown }[]): Promise<void> {
    const names = values.map((item) => item.name);
    const existing = await this.prisma.setting.findMany({
      where: { name: { in: names } },
    });
    const byName = new Map(existing.map((row) => [row.name, row.id]));

    await this.prisma.$transaction(
      values
        .filter((item) => byName.has(item.name))
        .map((item) =>
          this.prisma.setting.update({
            where: { id: byName.get(item.name) },
            data: { value: this.serialize(item.value) },
          }),
        ),
    );
  }

  /**
   * Stores the logo on the configured disk and saves its URL in the setting.
   */
  async uploadLogo(
    file: { originalname: string; buffer: Buffer },
    type?: string,
  ): Promise<string> {
    const filePath = await this.storage.put('logos', file, 'public');
    const url = this.storage.url(filePath, 'public');
    const key = type === 'dark' ? 'logo_dark' : 'logo';

    await this.prisma.setting.updateMany({
      where: { name: key },
      data: { value: url },
    });

    return url;
  }

  private cast(type: string, value: string | null): unknown {
    if (value === null) {
      return null;
    }

    if (type === 'integer') return Number(value);
    if (type === 'boolean') return value === '1' || value === 'true';
    if (type === 'array') {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        return [];
      }
    }

    return value;
  }

  private serialize(value: unknown): string | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'boolean') return value ? '1' : '0';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return value;

    return JSON.stringify(value);
  }
}
