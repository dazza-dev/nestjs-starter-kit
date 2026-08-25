import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { toSnakeCase } from '@/common/helpers/case.helper';

/**
 * Converts every JSON response's keys to snake_case, since the code works in camelCase.
 */
@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(map((body: unknown) => toSnakeCase(body)));
  }
}
