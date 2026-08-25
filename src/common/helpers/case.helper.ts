/**
 * Converts keys between the API contract (snake_case) and the code (camelCase).
 */

// Plain objects only: a Buffer, Date or StreamableFile is returned as-is.
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) return false;

  const proto: unknown = Object.getPrototypeOf(value);

  return proto === Object.prototype || proto === null;
};

const snake = (key: string): string =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

const camel = (key: string): string =>
  key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

function convert(value: unknown, transform: (key: string) => string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => convert(item, transform));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        transform(key),
        convert(val, transform),
      ]),
    );
  }

  return value;
}

export const toSnakeCase = (value: unknown): unknown => convert(value, snake);

export const toCamelCase = (value: unknown): unknown => convert(value, camel);
