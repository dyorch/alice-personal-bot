import type {
  ExpenseQuery,
  ExpenseSummaryPeriod,
  MessageLogQuery,
  ReminderQuery,
  WatchlistQuery,
} from '@alice/shared';

export const queryKeys = {
  expenses: {
    all: ['expenses'] as const,
    list: (q: Partial<ExpenseQuery> = {}) => ['expenses', 'list', q] as const,
    summary: (period: ExpenseSummaryPeriod) => ['expenses', 'summary', period] as const,
    detail: (id: number) => ['expenses', 'detail', id] as const,
  },
  reminders: {
    all: ['reminders'] as const,
    list: (q: Partial<ReminderQuery> = {}) => ['reminders', 'list', q] as const,
    detail: (id: number) => ['reminders', 'detail', id] as const,
  },
  watchlist: {
    all: ['watchlist'] as const,
    list: (q: Partial<WatchlistQuery> = {}) => ['watchlist', 'list', q] as const,
    counts: () => ['watchlist', 'counts'] as const,
    detail: (id: number) => ['watchlist', 'detail', id] as const,
  },
  messages: {
    all: ['messages'] as const,
    list: (q: Partial<MessageLogQuery> = {}) => ['messages', 'list', q] as const,
    stats: () => ['messages', 'stats'] as const,
    detail: (id: number) => ['messages', 'detail', id] as const,
  },
};
