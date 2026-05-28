import type { ColumnType, Generated } from 'kysely';

/**
 * Esquema tipado para Kysely. Con el CamelCasePlugin activo las columnas y
 * nombres de tabla en SQL son snake_case (por ejemplo `message_log`,
 * `sent_at`); en TS se referencian en camelCase (`messageLog`, `sentAt`).
 */

type IsoString = ColumnType<string, string | undefined, string>;

export interface ExpensesTable {
  id: Generated<number>;
  amount: number;
  currency: 'PEN' | 'USD';
  category: string;
  description: string;
  spentAt: string;
  createdAt: IsoString;
  updatedAt: IsoString;
}

export interface RemindersTable {
  id: Generated<number>;
  text: string;
  fireAt: string;
  sent: number;
  createdAt: IsoString;
  updatedAt: IsoString;
}

export interface WatchlistTable {
  id: Generated<number>;
  kind: 'movie' | 'series' | 'tiktok' | 'video' | 'other';
  title: string | null;
  url: string | null;
  notes: string | null;
  watched: number;
  createdAt: IsoString;
  watchedAt: string | null;
  updatedAt: IsoString;
}

export interface MessageLogTable {
  id: Generated<number>;
  direction: 'in' | 'out';
  senderPhone: string;
  senderName: string | null;
  waMessageId: string | null;
  body: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'other';
  intent: 'expense' | 'reminder' | 'watch' | 'unknown' | null;
  status:
    | 'allowed'
    | 'rejected_unknown_sender'
    | 'rejected_invalid_signature'
    | 'rejected_rate_limit'
    | 'sent'
    | 'failed';
  rejectionReason: string | null;
  rawPayload: string;
  createdAt: IsoString;
}

export interface Database {
  expenses: ExpensesTable;
  reminders: RemindersTable;
  watchlist: WatchlistTable;
  messageLog: MessageLogTable;
}
