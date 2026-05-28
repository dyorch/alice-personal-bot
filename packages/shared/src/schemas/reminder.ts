import { z } from 'zod';

import { IsoDateTime } from './common';

export const Reminder = z.object({
  id: z.number().int().positive(),
  text: z.string(),
  /** Momento de disparo en UTC. */
  fireAt: IsoDateTime,
  sent: z.boolean(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type Reminder = z.infer<typeof Reminder>;

export const CreateReminderInput = z.object({
  text: z.string().min(1).max(280),
  fireAt: IsoDateTime,
});
export type CreateReminderInput = z.infer<typeof CreateReminderInput>;

export const UpdateReminderInput = CreateReminderInput.partial();
export type UpdateReminderInput = z.infer<typeof UpdateReminderInput>;

export const ReminderStatus = z.enum(['pending', 'sent', 'all']);
export type ReminderStatus = z.infer<typeof ReminderStatus>;

export const ReminderQuery = z.object({
  status: ReminderStatus.default('all'),
  limit: z.coerce.number().int().positive().max(500).default(100),
  offset: z.coerce.number().int().nonnegative().default(0),
});
export type ReminderQuery = z.infer<typeof ReminderQuery>;
