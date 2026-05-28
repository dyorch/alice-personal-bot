import type {
  CreateWatchlistInput,
  UpdateWatchlistInput,
  WatchlistItem,
  WatchlistKind,
  WatchlistQuery,
} from '@alice/shared';
import type { Selectable } from 'kysely';

import { type Db, nowIso } from '../client.js';
import type { WatchlistTable } from '../schema.js';

type WatchlistRow = Selectable<WatchlistTable>;

function mapWatchlist(row: WatchlistRow): WatchlistItem {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    url: row.url,
    notes: row.notes,
    watched: row.watched === 1,
    createdAt: row.createdAt,
    watchedAt: row.watchedAt,
    updatedAt: row.updatedAt,
  };
}

export function watchlistRepo(db: Db) {
  return {
    async create(input: CreateWatchlistInput): Promise<WatchlistItem> {
      const now = nowIso();
      const row = await db
        .insertInto('watchlist')
        .values({
          kind: input.kind,
          title: input.title ?? null,
          url: input.url ?? null,
          notes: input.notes ?? null,
          watched: 0,
          createdAt: now,
          watchedAt: null,
          updatedAt: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return mapWatchlist(row);
    },

    async list(q: WatchlistQuery): Promise<WatchlistItem[]> {
      let query = db.selectFrom('watchlist').selectAll();
      if (q.status === 'pending') query = query.where('watched', '=', 0);
      else if (q.status === 'watched') query = query.where('watched', '=', 1);
      if (q.kind) query = query.where('kind', '=', q.kind);
      const rows = await query
        .orderBy('createdAt', 'desc')
        .limit(q.limit)
        .offset(q.offset)
        .execute();
      return rows.map(mapWatchlist);
    },

    async get(id: number): Promise<WatchlistItem | null> {
      const row = await db
        .selectFrom('watchlist')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();
      return row ? mapWatchlist(row) : null;
    },

    async update(id: number, input: UpdateWatchlistInput): Promise<WatchlistItem | null> {
      const values: Record<string, unknown> = { updatedAt: nowIso() };
      if (input.kind !== undefined) values.kind = input.kind;
      if (input.title !== undefined) values.title = input.title;
      if (input.url !== undefined) values.url = input.url;
      if (input.notes !== undefined) values.notes = input.notes;
      if (input.watched !== undefined) {
        values.watched = input.watched ? 1 : 0;
        values.watchedAt = input.watched ? nowIso() : null;
      }
      const row = await db
        .updateTable('watchlist')
        .set(values)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst();
      return row ? mapWatchlist(row) : null;
    },

    async remove(id: number): Promise<boolean> {
      const result = await db
        .deleteFrom('watchlist')
        .where('id', '=', id)
        .executeTakeFirst();
      return Number(result.numDeletedRows ?? 0n) > 0;
    },

    async countsByKind(): Promise<Record<WatchlistKind, number>> {
      const rows = await db
        .selectFrom('watchlist')
        .select(['kind'])
        .where('watched', '=', 0)
        .execute();
      const counts: Record<WatchlistKind, number> = {
        movie: 0,
        series: 0,
        tiktok: 0,
        video: 0,
        other: 0,
      };
      for (const r of rows) counts[r.kind] += 1;
      return counts;
    },
  };
}
