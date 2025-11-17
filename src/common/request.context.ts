import { AsyncLocalStorage } from 'async_hooks';
import type { Request } from 'express';

const storage = new AsyncLocalStorage<Request>();

export class RequestContext {
  static run<T>(req: Request, callback: () => T): T {
    return storage.run(req, callback);
  }

  static getRequest(): Request | undefined {
    return storage.getStore();
  }

  static getPath(): string | null {
    const req = storage.getStore();
    return req ? req.path : null;
  }

  static getUrl(): string | null {
    const req = storage.getStore();
    if (!req) return null;
    const protocol = req.protocol;
    const host = req.get('host');
    const originalPath = req.originalUrl.split('?')[0];
    return host ? `${protocol}://${host}${originalPath}` : null;
  }
}
