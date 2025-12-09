import { HttpException, HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

export class ValidationException extends HttpException {
  constructor(field: string, message: string) {
    const i18n = I18nContext.current();
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: i18n
          ? i18n.t('validation.invalid_data')
          : 'The given data was invalid',
        errors: {
          [field]: [message],
        },
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
