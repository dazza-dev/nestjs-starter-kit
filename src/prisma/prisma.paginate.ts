import { RequestContext } from '@/common/request.context';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  route?: string | null; // URL base to build links
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first: string | null;
    last: string | null;
    next: string | null;
    prev: string | null;
  };
}

export async function prismaPaginate<
  T,
  A extends Record<string, unknown> & { where?: unknown },
>(
  prismaModel: {
    findMany: (args?: A & { skip?: number; take?: number }) => Promise<T[]>;
    count: (args?: { where?: A['where'] }) => Promise<number>;
  },
  findManyArgs: A,
  options: PaginationOptions,
): Promise<PaginationResult<T>> {
  const rawPage = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const route = options.route ?? RequestContext.getUrl();

  const totalItems = await prismaModel.count({
    where: (findManyArgs as { where?: A['where'] }).where,
  });

  const totalPages = Math.ceil(totalItems / limit);
  const safeTotalPages = Math.max(totalPages, 1);
  const page = Math.min(Math.max(rawPage, 1), safeTotalPages);

  const skip = (page - 1) * limit;

  const items = await prismaModel.findMany({
    ...findManyArgs,
    skip,
    take: limit,
  });

  const sep = route && route.includes('?') ? '&' : '?';
  const qs = (p: number): string | null =>
    route ? `${route}${sep}page=${p}&limit=${limit}` : null;

  return {
    data: items,
    meta: {
      itemCount: items.length,
      totalItems,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    },
    links: {
      first: totalItems > 0 ? qs(1) : null,
      prev: page > 1 ? qs(page - 1) : null,
      next: page < totalPages ? qs(page + 1) : null,
      last: totalItems > 0 ? qs(totalPages) : null,
    },
  };
}
