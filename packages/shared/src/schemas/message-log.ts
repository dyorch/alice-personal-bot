import { z } from 'zod';

import {
  IsoDateTime,
  MessageDirection,
  MessageIntent,
  MessageStatus,
  MessageType,
  PhoneE164,
} from './common';

export const MessageLogEntry = z.object({
  id: z.number().int().positive(),
  direction: MessageDirection,
  senderPhone: PhoneE164.or(z.literal('')),
  senderName: z.string().nullable(),
  waMessageId: z.string().nullable(),
  body: z.string(),
  messageType: MessageType,
  intent: MessageIntent.nullable(),
  status: MessageStatus,
  rejectionReason: z.string().nullable(),
  rawPayload: z.string(),
  createdAt: IsoDateTime,
});
export type MessageLogEntry = z.infer<typeof MessageLogEntry>;

export const MessageLogStatusFilter = z.enum([
  'all',
  'allowed',
  'rejected',
  'rejected_unknown_sender',
  'rejected_invalid_signature',
  'rejected_rate_limit',
]);
export type MessageLogStatusFilter = z.infer<typeof MessageLogStatusFilter>;

export const MessageLogQuery = z.object({
  from: IsoDateTime.optional(),
  to: IsoDateTime.optional(),
  status: MessageLogStatusFilter.default('all'),
  sender: z.string().optional(),
  limit: z.coerce.number().int().positive().max(500).default(100),
  offset: z.coerce.number().int().nonnegative().default(0),
});
export type MessageLogQuery = z.infer<typeof MessageLogQuery>;

export const MessageLogStats = z.object({
  receivedToday: z.number().int().nonnegative(),
  rejectedToday: z.number().int().nonnegative(),
  distinctUnknownSenders30d: z.number().int().nonnegative(),
  rejectionsLast24h: z.number().int().nonnegative(),
});
export type MessageLogStats = z.infer<typeof MessageLogStats>;
