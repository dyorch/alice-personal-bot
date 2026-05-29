import type {
  CreateReminderInput,
  Reminder,
  ReminderQuery,
  UpdateReminderInput,
} from '@alice/shared';

import { http, qs } from '@/lib/http';

export const remindersService = {
  list: (q: Partial<ReminderQuery> = {}) => http<Reminder[]>(`/api/reminders${qs(q)}`),

  get: (id: number) => http<Reminder>(`/api/reminders/${id}`),

  create: (input: CreateReminderInput) =>
    http<Reminder>('/api/reminders', { method: 'POST', body: JSON.stringify(input) }),

  update: (id: number, input: UpdateReminderInput) =>
    http<Reminder>(`/api/reminders/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),

  remove: (id: number) =>
    http<{ id: number; deleted: true }>(`/api/reminders/${id}`, { method: 'DELETE' }),
};
