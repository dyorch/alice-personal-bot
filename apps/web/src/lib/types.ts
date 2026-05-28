// Los tipos viven en @alice/shared para no divergir del worker.
// Este archivo solo re-exporta para mantener estables los imports existentes.

export type {
  Currency,
  Expense,
  MessageDirection,
  MessageIntent,
  MessageLogEntry,
  MessageLogStats,
  MessageStatus,
  MessageType,
  Reminder,
  WatchlistItem,
  WatchlistKind,
} from '@alice/shared';

export { CURRENCIES, WATCHLIST_KINDS } from '@alice/shared';
