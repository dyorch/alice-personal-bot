// Tipos del dominio. En el proyecto final viviran en packages/shared y se
// compartiran entre el Worker y la web; aqui son locales para el mockup.

export const CURRENCIES = ['PEN', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface Expense {
  id: number;
  amount: number;
  currency: Currency;
  category: string;
  description: string;
  /** Fecha del gasto en formato YYYY-MM-DD (hora local de Lima). */
  spentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: number;
  text: string;
  /** Momento de disparo en ISO 8601 (UTC). */
  fireAt: string;
  sent: boolean;
  createdAt: string;
}

export const WATCHLIST_KINDS = ['movie', 'series', 'tiktok', 'video', 'other'] as const;
export type WatchlistKind = (typeof WATCHLIST_KINDS)[number];

export interface WatchlistItem {
  id: number;
  kind: WatchlistKind;
  title: string;
  url: string | null;
  notes: string | null;
  watched: boolean;
  createdAt: string;
  watchedAt: string | null;
}

export type MessageDirection = 'in' | 'out';

export type MessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'location'
  | 'other';

export type MessageStatus =
  | 'allowed'
  | 'rejected_unknown_sender'
  | 'rejected_invalid_signature'
  | 'rejected_rate_limit'
  | 'sent'
  | 'failed';

export type MessageIntent = 'expense' | 'reminder' | 'watch' | 'unknown' | null;

export interface MessageLogEntry {
  id: number;
  direction: MessageDirection;
  senderPhone: string;
  senderName: string | null;
  waMessageId: string | null;
  body: string;
  messageType: MessageType;
  intent: MessageIntent;
  status: MessageStatus;
  rejectionReason: string | null;
  rawPayload: string;
  createdAt: string;
}
