import type {
  CreateReminderInput,
  Reminder,
  ReminderQuery,
  UpdateReminderInput,
} from '@alice/shared';

import { type Db, nowIso } from '../client.js';
import type { RemindersTable } from '../schema.js';
import type { Selectable } from 'kysely';

type RemindersRow = Selectable<RemindersTable>;

function mapReminder(row: RemindersRow): Reminder {
  return {
    id: row.id,
    text: row.text,
    fireAt: row.fireAt,
    sent: row.sent === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function reminderRepo(db: Db) {
  return {
    async create(input: CreateReminderInput): Promise<Reminder> {
      const now = nowIso();
      const row = await db
        .insertInto('reminders')
        .values({ text: input.text, fireAt: input.fireAt, sent: 0, createdAt: now, updatedAt: now })
        .returningAll()
        .executeTakeFirstOrThrow();
      return mapReminder(row);
    },

    async list(q: ReminderQuery): Promise<Reminder[]> {
      let query = db.selectFrom('reminders').selectAll();
      if (q.status === 'pending') query = query.where('sent', '=', 0);
      else if (q.status === 'sent') query = query.where('sent', '=', 1);
      const rows = await query
        .orderBy('fireAt', 'asc')
        .limit(q.limit)
        .offset(q.offset)
        .execute();
      return rows.map(mapReminder);
    },

    async get(id: number): Promise<Reminder | null> {
      const row = await db
        .selectFrom('reminders')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();
      return row ? mapReminder(row) : null;
    },

    async update(id: number, input: UpdateReminderInput): Promise<Reminder | null> {
      const values: Record<string, unknown> = { updatedAt: nowIso() };
      if (input.text !== undefined) values.text = input.text;
      if (input.fireAt !== undefined) values.fireAt = input.fireAt;
      const row = await db
        .updateTable('reminders')
        .set(values)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst();
      return row ? mapReminder(row) : null;
    },

    async remove(id: number): Promise<boolean> {
      const result = await db
        .deleteFrom('reminders')
        .where('id', '=', id)
        .executeTakeFirst();
      return Number(result.numDeletedRows ?? 0n) > 0;
    },

    /** Recordatorios pendientes cuyo `fireAt` ya vencio. */
    async duePending(nowUtc: string, limit = 50): Promise<Reminder[]> {
      const rows = await db
        .selectFrom('reminders')
        .selectAll()
        .where('sent', '=', 0)
        .where('fireAt', '<=', nowUtc)
        .orderBy('fireAt', 'asc')
        .limit(limit)
        .execute();
      return rows.map(mapReminder);
    },

    /**
     * Marca el recordatorio como enviado de forma atómica. Solo actualiza si
     * `sent = 0`; devuelve `true` si la fila fue actualizada (el caller tiene
     * la responsabilidad exclusiva de enviar). Esto previene duplicados si
     * dos crons se solapan.
     */
    async markSent(id: number): Promise<boolean> {
      const result = await db
        .updateTable('reminders')
        .set({ sent: 1, updatedAt: nowIso() })
        .where('id', '=', id)
        .where('sent', '=', 0)
        .executeTakeFirst();
      return Number(result?.numUpdatedRows ?? 0n) > 0;
    },
  };
}
