const LOCALE = 'en-US';
const TIME_ZONE = 'UTC';

export class DateFormatterHelper {
  /**
   * Formats a date with full format.
   */
  static formatLong(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleString(LOCALE, {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Formats a date with the default format.
   */
  static format(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(LOCALE, { timeZone: TIME_ZONE });
  }

  /**
   * Formats only the date, without the time.
   */
  static formatDateOnly(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString(LOCALE, {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Formats only the time.
   */
  static formatTimeOnly(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleTimeString(LOCALE, {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
