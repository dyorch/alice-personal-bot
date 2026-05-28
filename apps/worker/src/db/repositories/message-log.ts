import type {
  MessageLogEntry,
  MessageLogQuery,
  MessageLogStats,
} from '@alice/shared';
import type { Insertable, Selectable } from 'kysely';

import { type Db, nowIso } from '../client.js';
import type { MessageLogTable } from '../schema.js';
import { localDate, startOfDayInTz } from '../../utils/time.js';

type MessageLogRow = Selectable<MessageLogTable>;
type MessageLogInsert = Insertable<MessageLogTable>;

const REJECTED_STATUSES = [
  'rejected_unknown_sender',
  'rejected_invalid_signature',
  'rejected_rate_limit',
] as const;

function mapEntry(row: MessageLogRow): MessageLogEntry {
  return {
    id: row.id,
    direction: row.direction,
    senderPhone: row.senderPhone,
    senderName: row.senderName,
    waMessageId: row.waMessageId,
    body: row.body,
    messageType: row.messageType,
    intent: row.intent,
    status: row.status,
    rejectionReason: row.rejectionReason,
    rawPayload: row.rawPayload,
    createdAt: row.createdAt,
  };
}

export function messageLogRepo(db: Db) {
  return {
    async log(entry: Omit<MessageLogInsert, 'createdAt'>): Promise<MessageLogEntry> {
      const row = await db
        .insertInto('messageLog')
        .values({ ...entry, createdAt: nowIso() })
        .returningAll()
        .executeTakeFirstOrThrow();
      return mapEntry(row);
    },

    async list(q: MessageLogQuery): Promise<MessageLogEntry[]> {
      let query = db.selectFrom('messageLog').selectAll();
      if (q.from) query = query.where('createdAt', '>=', q.from);
      if (q.to) query = query.where('createdAt', '<=', q.to);
      if (q.sender) query = query.where('senderPhone', 'like', `%${q.sender}%`);
      if (q.status === 'allowed') query = query.where('status', '=', 'allowed');
      else if (q.status === 'rejected') query = query.where('status', 'in', REJECTED_STATUSES);
      else if (q.status !== 'all') query = query.where('status', '=', q.status);
      const rows = await query
        .orderBy('createdAt', 'desc')
        .limit(q.limit)
        .offset(q.offset)
        .execute();
      return rows.map(mapEntry);
    },

    async get(id: number): Promise<MessageLogEntry | null> {
      const row = await db
        .selectFrom('messageLog')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();
      return row ? mapEntry(row) : null;
    },

    /**
     * Verifica si ya procesamos un mensaje con este `wa_message_id` (Meta
     * reintenta el webhook si no responde 200; usa esto para deduplicar).
     */
    async existsByWaId(waMessageId: string): Promise<boolean> {
      const row = await db
        .selectFrom('messageLog')
        .select('id')
        .where('waMessageId', '=', waMessageId)
        .executeTakeFirst();
      return row !== undefined;
    },

    async stats(tz: string): Promise<MessageLogStats> {
      const now = new Date();
      const today = localDate(now, tz);
      const startToday = startOfDayInTz(today, tz).toISOString();
      const since24h = new Date(now.getTime() - 86_400_000).toISOString();
      const since30d = new Date(now.getTime() - 30 * 86_400_000).toISOString();

      const incomingToday = await db
        .selectFrom('messageLog')
        .select((eb) => eb.fn.countAll<number>().as('n'))
        .where('direction', '=', 'in')
        .where('createdAt', '>=', startToday)
        .executeTakeFirstOrThrow();

      const rejectedToday = await db
        .selectFrom('messageLog')
        .select((eb) => eb.fn.countAll<number>().as('n'))
        .where('direction', '=', 'in')
        .where('createdAt', '>=', startToday)
        .where('status', 'in', REJECTED_STATUSES)
        .executeTakeFirstOrThrow();

      const last24h = await db
        .selectFrom('messageLog')
        .select((eb) => eb.fn.countAll<number>().as('n'))
        .where('direction', '=', 'in')
        .where('status', 'in', REJECTED_STATUSES)
        .where('createdAt', '>=', since24h)
        .executeTakeFirstOrThrow();

      const distinct30d = await db
        .selectFrom('messageLog')
        .select((eb) => eb.fn.count('senderPhone').distinct().as('n'))
        .where('direction', '=', 'in')
        .where('status', '=', 'rejected_unknown_sender')
        .where('createdAt', '>=', since30d)
        .executeTakeFirstOrThrow();

      return {
        receivedToday: Number(incomingToday.n),
        rejectedToday: Number(rejectedToday.n),
        rejectionsLast24h: Number(last24h.n),
        distinctUnknownSenders30d: Number(distinct30d.n),
      };
    },

    /** Borra mensajes con `created_at` mas antiguos que `days` dias. */
    async purgeOlderThan(days: number): Promise<number> {
      const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
      const result = await db
        .deleteFrom('messageLog')
        .where('createdAt', '<', cutoff)
        .executeTakeFirst();
      return Number(result.numDeletedRows ?? 0n);
    },
  };
}
