import { ArgumentsHost, ValidationError } from '@nestjs/common';
import {
  I18nContext,
  I18nValidationException,
  I18nValidationExceptionFilter,
} from 'nestjs-i18n';

export const validationFilter = new I18nValidationExceptionFilter({
  errorHttpStatusCode: 422,
  errorFormatter: (errors: ValidationError[]) => {
    const result: Record<string, string[]> = {};
    errors.forEach((error) => {
      result[error.property] = Object.values(error.constraints || {});
    });
    return result;
  },
  responseBodyFormatter: (
    host: ArgumentsHost,
    exc: I18nValidationException,
    formattedErrors: object,
  ) => {
    const i18n = I18nContext.current();
    return {
      statusCode: 422,
      message: i18n
        ? i18n.t('validation.invalid_data')
        : 'The given data was invalid',
      errors: formattedErrors,
    };
  },
});
