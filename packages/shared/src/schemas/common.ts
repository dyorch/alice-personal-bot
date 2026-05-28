import { z } from 'zod';

export const CURRENCIES = ['PEN', 'USD'] as const;
export const Currency = z.enum(CURRENCIES);
export type Currency = z.infer<typeof Currency>;

export const WATCHLIST_KINDS = ['movie', 'series', 'tiktok', 'video', 'other'] as const;
export const WatchlistKind = z.enum(WATCHLIST_KINDS);
export type WatchlistKind = z.infer<typeof WatchlistKind>;

export const MessageDirection = z.enum(['in', 'out']);
export type MessageDirection = z.infer<typeof MessageDirection>;

export const MessageType = z.enum([
  'text',
  'image',
  'audio',
  'video',
  'document',
  'location',
  'other',
]);
export type MessageType = z.infer<typeof MessageType>;

export const MessageStatus = z.enum([
  'allowed',
  'rejected_unknown_sender',
  'rejected_invalid_signature',
  'rejected_rate_limit',
  'sent',
  'failed',
]);
export type MessageStatus = z.infer<typeof MessageStatus>;

export const MessageIntent = z.enum(['expense', 'reminder', 'watch', 'unknown']);
export type MessageIntent = z.infer<typeof MessageIntent>;

/** Fecha local en formato `YYYY-MM-DD`. */
export const LocalDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe tener formato YYYY-MM-DD');
export type LocalDateString = z.infer<typeof LocalDateString>;

/** Datetime ISO 8601 con zona horaria. */
export const IsoDateTime = z.string().datetime({ offset: true });
export type IsoDateTime = z.infer<typeof IsoDateTime>;

/** Numero de telefono en formato E.164 sin el '+' inicial. */
export const PhoneE164 = z.string().regex(/^\d{8,15}$/, 'Debe ser E.164 sin el "+" inicial');
export type PhoneE164 = z.infer<typeof PhoneE164>;
