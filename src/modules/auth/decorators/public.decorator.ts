import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public; `AuthGuard` lets it through without a session.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
