import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { toCamelCase } from '@/common/helpers/case.helper';

/**
 * Converts every request's body and query to camelCase, since DTOs are declared in camelCase.
 */
@Injectable()
export class CamelCaseMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (req.body && typeof req.body === 'object') {
      req.body = toCamelCase(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      Object.defineProperty(req, 'query', {
        value: toCamelCase(req.query),
        writable: true,
        configurable: true,
      });
    }

    next();
  }
}
