import { RequestContext } from '@/common/request.context';

export interface PaginationOptions {
  page?: number;
  perPage?: number;
  route?: string | null;
}

/**
 * Pagination wrapper with links and metadata per page.
 */
export interface PaginationResult<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    currentPage: number;
    from: number | null;
    lastPage: number;
    links: {
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }[];
    path: string;
    perPage: number;
    to: number | null;
    total: number;
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
  const perPage = Number(options.perPage) || 15;
  const path = (options.route ?? RequestContext.getUrl() ?? '').split('?')[0];

  const total = await prismaModel.count({
    where: (findManyArgs as { where?: A['where'] }).where,
  });
  const lastPage = Math.max(Math.ceil(total / perPage), 1);
  const page = Math.min(Math.max(Number(options.page) || 1, 1), lastPage);

  const items = await prismaModel.findMany({
    ...findManyArgs,
    skip: (page - 1) * perPage,
    take: perPage,
  });

  const url = (p: number): string => `${path}?page=${p}`;

  // One link per page, plus previous and next at the ends.
  const links: PaginationResult<T>['meta']['links'] = [
    {
      url: page > 1 ? url(page - 1) : null,
      label: '&laquo; Previous',
      page: page > 1 ? page - 1 : null,
      active: false,
    },
    ...Array.from({ length: lastPage }, (_, i) => ({
      url: url(i + 1),
      label: String(i + 1),
      page: i + 1,
      active: i + 1 === page,
    })),
    {
      url: page < lastPage ? url(page + 1) : null,
      label: 'Next &raquo;',
      page: page < lastPage ? page + 1 : null,
      active: false,
    },
  ];

  return {
    data: items,
    links: {
      first: url(1),
      last: url(lastPage),
      prev: page > 1 ? url(page - 1) : null,
      next: page < lastPage ? url(page + 1) : null,
    },
    meta: {
      currentPage: page,
      from: items.length ? (page - 1) * perPage + 1 : null,
      lastPage,
      links,
      path,
      perPage,
      to: items.length ? (page - 1) * perPage + items.length : null,
      total,
    },
  };
}
