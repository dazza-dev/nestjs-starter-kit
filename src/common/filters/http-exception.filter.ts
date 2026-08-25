import { Catch, HttpException } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

/**
 * Gives errors the same shape as the rest of the API: `message` and, on 422s, `errors` by field.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();

    const payload =
      typeof body === 'string'
        ? {}
        : (body as {
            message?: string | string[];
            errors?: Record<string, string[]>;
          });

    const message =
      typeof body === 'string' ? body : (payload.message ?? exception.message);

    response.status(status).json({
      message: Array.isArray(message) ? message[0] : message,
      ...(payload.errors ? { errors: payload.errors } : {}),
    });
  }
}
