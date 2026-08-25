import type { Response, CookieOptions } from 'express';

/**
 * Session cookie options based on the environment.
 */
function getCookieOptions(): CookieOptions {
  const isProduction = process.env.APP_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}

export function setAuthTokenCookie(res: Response, token: string): void {
  res.cookie('AUTH_TOKEN', token, getCookieOptions());
}

export function clearAuthTokenCookie(res: Response): void {
  res.clearCookie('AUTH_TOKEN', getCookieOptions());
}

export function clearAllAuthCookies(res: Response): void {
  clearAuthTokenCookie(res);
}
