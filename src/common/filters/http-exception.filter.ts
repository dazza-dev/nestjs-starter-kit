import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let responseBody: any;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      responseBody = exceptionResponse;
    } else {
      responseBody = {
        statusCode: status,
        message: exceptionResponse,
      };
    }

    response.status(status).json(responseBody);
  }
}
