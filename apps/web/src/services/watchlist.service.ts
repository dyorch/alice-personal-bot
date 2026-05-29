import type {
  CreateWatchlistInput,
  UpdateWatchlistInput,
  WatchlistItem,
  WatchlistKind,
  WatchlistQuery,
} from '@alice/shared';

import { http, qs } from '@/lib/http';

export const watchlistService = {
  list: (q: Partial<WatchlistQuery> = {}) => http<WatchlistItem[]>(`/api/watchlist${qs(q)}`),

  counts: () => http<Record<WatchlistKind, number>>('/api/watchlist/counts'),

  get: (id: number) => http<WatchlistItem>(`/api/watchlist/${id}`),

  create: (input: CreateWatchlistInput) =>
    http<WatchlistItem>('/api/watchlist', { method: 'POST', body: JSON.stringify(input) }),

  update: (id: number, input: UpdateWatchlistInput) =>
    http<WatchlistItem>(`/api/watchlist/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    http<{ id: number; deleted: true }>(`/api/watchlist/${id}`, { method: 'DELETE' }),
};
