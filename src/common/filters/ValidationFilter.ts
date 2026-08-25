import { ArgumentsHost, ValidationError } from '@nestjs/common';
import {
  I18nContext,
  I18nValidationException,
  I18nValidationExceptionFilter,
} from 'nestjs-i18n';
import { toSnakeCase } from '@/common/helpers/case.helper';

/**
 * Validation filter with i18n support that gives errors a consistent shape.
 */
export const validationFilter = new I18nValidationExceptionFilter({
  errorHttpStatusCode: 422,
  errorFormatter: (errors: ValidationError[]) => {
    const result: Record<string, string[]> = {};

    // Nested errors are flattened with a dotted path: sort_by.0.order.
    const walk = (list: ValidationError[], prefix = ''): void => {
      list.forEach((error) => {
        const path = prefix ? `${prefix}.${error.property}` : error.property;

        // Intermediate levels have empty `constraints`; only leaves count.
        const messages = [...new Set(Object.values(error.constraints ?? {}))];

        if (messages.length) {
          // Several rules can share a message; the field shows it only once.
          result[path] = messages;
        }

        if (error.children?.length) {
          walk(error.children, path);
        }
      });
    };

    walk(errors);

    // Keys go out in snake_case, like every other response.
    return toSnakeCase(result) as Record<string, string[]>;
  },
  responseBodyFormatter: (
    host: ArgumentsHost,
    exc: I18nValidationException,
    formattedErrors: Record<string, string[]>,
  ) => {
    const i18n = I18nContext.current();
    // The first error is used as the message; the full detail goes by field.
    const first = Object.values(formattedErrors)[0]?.[0];

    return {
      message:
        first ??
        (i18n
          ? i18n.t('validation.invalid_data')
          : 'The given data was invalid'),
      errors: formattedErrors,
    };
  },
});
