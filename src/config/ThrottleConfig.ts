import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { I18nContext } from 'nestjs-i18n';

export default (): ThrottlerModuleOptions => ({
  errorMessage: (context) =>
    I18nContext.current(context)!.t('validation.too_many_requests'),
  throttlers: [
    {
      name: 'short',
      ttl: 1000,
      limit: 10,
    },
    {
      name: 'medium',
      ttl: 60000,
      limit: 100,
    },
    {
      name: 'long',
      ttl: 900000,
      limit: 1000,
    },
  ],
});
