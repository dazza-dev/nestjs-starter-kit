import { AsyncLocalStorage } from 'async_hooks';
import type { Request } from 'express';

const storage = new AsyncLocalStorage<Request>();

/**
 * Request context, based on AsyncLocalStorage, for accessing data from the current HTTP request.
 */
export class RequestContext {
  /**
   * Runs a callback within the context of a specific request.
   */
  static run<T>(req: Request, callback: () => T): T {
    return storage.run(req, callback);
  }

  /**
   * Gets the current HTTP request.
   */
  static getRequest(): Request | undefined {
    return storage.getStore();
  }

  /**
   * Gets the current request's path.
   */
  static getPath(): string | null {
    const req = storage.getStore();
    return req ? req.path : null;
  }

  /**
   * Gets the current request's full URL.
   */
  static getUrl(): string | null {
    const req = storage.getStore();
    if (!req) return null;
    const protocol = req.protocol;
    const host = req.get('host');
    const originalPath = req.originalUrl.split('?')[0];
    return host ? `${protocol}://${host}${originalPath}` : null;
  }
}
