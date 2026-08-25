import type { SortCriterionDto } from '@/common/dto/sort-criterion.dto';

/**
 * Resolves the order requested by the SPA against the `sortable` whitelist; an
 * unknown key falls back to the default order.
 */
export function resolveSort<T extends string>(
  sortBy: SortCriterionDto[] | undefined,
  sortable: Record<string, T>,
  defaultKey: keyof typeof sortable,
  defaultOrder: 'asc' | 'desc' = 'asc',
): Record<string, 'asc' | 'desc'> {
  const sort = sortBy?.[0];
  const key = sort?.key;

  if (!key || !(key in sortable)) {
    return { [sortable[defaultKey]]: defaultOrder };
  }

  return { [sortable[key]]: sort?.order === 'desc' ? 'desc' : 'asc' };
}
