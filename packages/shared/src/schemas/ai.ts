import { z } from 'zod';

import { Currency, WatchlistKind } from './common.js';

/**
 * Respuesta esperada del clasificador (Workers AI). El prompt obliga a JSON
 * estricto; si el modelo devuelve algo distinto se cae a `unknown`.
 */

export const AiExpenseData = z.object({
  amount: z.number().positive(),
  currency: Currency.default('PEN'),
  category: z.string().min(1).max(40),
  description: z.string().max(280).default(''),
});

export const AiReminderData = z.object({
  /** "YYYY-MM-DD HH:mm" en zona local del usuario. */
  fire_at: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, 'Formato YYYY-MM-DD HH:mm'),
  text: z.string().min(1).max(280),
});

export const AiWatchData = z.object({
  kind: WatchlistKind,
  title: z.string().min(1).max(280).nullable(),
  url: z.string().url().nullable(),
});

export const AiClassification = z.discriminatedUnion('intent', [
  z.object({ intent: z.literal('expense'), data: AiExpenseData }),
  z.object({ intent: z.literal('reminder'), data: AiReminderData }),
  z.object({ intent: z.literal('watch'), data: AiWatchData }),
  z.object({ intent: z.literal('unknown'), data: z.record(z.unknown()).default({}) }),
]);
export type AiClassification = z.infer<typeof AiClassification>;
