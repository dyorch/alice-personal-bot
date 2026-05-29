import type {
  MessageLogEntry,
  MessageLogQuery,
  MessageLogStats,
} from '@alice/shared';

import { http, qs } from '@/lib/http';

export const messagesService = {
  list: (q: Partial<MessageLogQuery> = {}) =>
    http<MessageLogEntry[]>(`/api/message-log${qs(q)}`),

  stats: () => http<MessageLogStats>('/api/message-log/stats'),

  get: (id: number) => http<MessageLogEntry>(`/api/message-log/${id}`),
};
