import { z } from 'zod';

import { IsoDateTime, WatchlistKind } from './common.js';

export const WatchlistItem = z.object({
  id: z.number().int().positive(),
  kind: WatchlistKind,
  title: z.string().nullable(),
  url: z.string().url().nullable(),
  notes: z.string().nullable(),
  watched: z.boolean(),
  createdAt: IsoDateTime,
  watchedAt: IsoDateTime.nullable(),
  updatedAt: IsoDateTime,
});
export type WatchlistItem = z.infer<typeof WatchlistItem>;

export const CreateWatchlistInput = z.object({
  kind: WatchlistKind,
  title: z.string().min(1).max(280).optional(),
  url: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});
export type CreateWatchlistInput = z.infer<typeof CreateWatchlistInput>;

export const UpdateWatchlistInput = CreateWatchlistInput.partial().extend({
  watched: z.boolean().optional(),
});
export type UpdateWatchlistInput = z.infer<typeof UpdateWatchlistInput>;

export const WatchlistStatus = z.enum(['pending', 'watched', 'all']);
export type WatchlistStatus = z.infer<typeof WatchlistStatus>;

export const WatchlistQuery = z.object({
  status: WatchlistStatus.default('all'),
  kind: WatchlistKind.optional(),
  limit: z.coerce.number().int().positive().max(500).default(100),
  offset: z.coerce.number().int().nonnegative().default(0),
});
export type WatchlistQuery = z.infer<typeof WatchlistQuery>;
