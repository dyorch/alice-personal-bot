import type {
  CreateExpenseInput,
  CreateReminderInput,
  CreateWatchlistInput,
  Expense,
  ExpenseQuery,
  ExpenseSummary,
  ExpenseSummaryPeriod,
  MessageLogEntry,
  MessageLogQuery,
  MessageLogStats,
  Reminder,
  ReminderQuery,
  UpdateExpenseInput,
  UpdateReminderInput,
  UpdateWatchlistInput,
  WatchlistItem,
  WatchlistKind,
  WatchlistQuery,
} from '@alice/shared';

const BASE = (import.meta.env.VITE_WORKER_API_BASE as string | undefined) ?? 'http://localhost:8787';
const TOKEN = (import.meta.env.VITE_API_SHARED_TOKEN as string | undefined) ?? '';

interface ApiOk<T> {
  ok: true;
  data: T;
  error: null;
}
interface ApiErr {
  ok: false;
  data: null;
  error: { code: string; message: string; details?: unknown };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!TOKEN) {
    throw new Error(
      'VITE_API_SHARED_TOKEN no está definido. Copia .env.example a .env.local y complétalo.',
    );
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const body = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null;
  if (!body) {
    throw new Error(`Respuesta no JSON del worker (HTTP ${res.status})`);
  }
  if (!body.ok) {
    throw new Error(`${body.error.code}: ${body.error.message}`);
  }
  return body.data;
}

function qs(params: Record<string, unknown>): string {
  const pairs: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return pairs.length === 0 ? '' : `?${pairs.join('&')}`;
}

export const api = {
  expenses: {
    list: (q: Partial<ExpenseQuery> = {}) => request<Expense[]>(`/api/expenses${qs(q)}`),
    summary: (period: ExpenseSummaryPeriod) =>
      request<ExpenseSummary>(`/api/expenses/summary?period=${period}`),
    get: (id: number) => request<Expense>(`/api/expenses/${id}`),
    create: (input: CreateExpenseInput) =>
      request<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: number, input: UpdateExpenseInput) =>
      request<Expense>(`/api/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    remove: (id: number) =>
      request<{ id: number; deleted: true }>(`/api/expenses/${id}`, { method: 'DELETE' }),
  },
  reminders: {
    list: (q: Partial<ReminderQuery> = {}) =>
      request<Reminder[]>(`/api/reminders${qs(q)}`),
    get: (id: number) => request<Reminder>(`/api/reminders/${id}`),
    create: (input: CreateReminderInput) =>
      request<Reminder>('/api/reminders', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: number, input: UpdateReminderInput) =>
      request<Reminder>(`/api/reminders/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    remove: (id: number) =>
      request<{ id: number; deleted: true }>(`/api/reminders/${id}`, { method: 'DELETE' }),
  },
  watchlist: {
    list: (q: Partial<WatchlistQuery> = {}) =>
      request<WatchlistItem[]>(`/api/watchlist${qs(q)}`),
    counts: () => request<Record<WatchlistKind, number>>('/api/watchlist/counts'),
    get: (id: number) => request<WatchlistItem>(`/api/watchlist/${id}`),
    create: (input: CreateWatchlistInput) =>
      request<WatchlistItem>('/api/watchlist', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: number, input: UpdateWatchlistInput) =>
      request<WatchlistItem>(`/api/watchlist/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    remove: (id: number) =>
      request<{ id: number; deleted: true }>(`/api/watchlist/${id}`, { method: 'DELETE' }),
  },
  messages: {
    list: (q: Partial<MessageLogQuery> = {}) =>
      request<MessageLogEntry[]>(`/api/message-log${qs(q)}`),
    stats: () => request<MessageLogStats>('/api/message-log/stats'),
    get: (id: number) => request<MessageLogEntry>(`/api/message-log/${id}`),
  },
};

// Query keys centralizados para invalidar/correlacionar caches con TanStack Query.
export const queryKeys = {
  expenses: {
    all: ['expenses'] as const,
    list: (q: Partial<ExpenseQuery> = {}) => ['expenses', 'list', q] as const,
    summary: (period: ExpenseSummaryPeriod) => ['expenses', 'summary', period] as const,
  },
  reminders: {
    all: ['reminders'] as const,
    list: (q: Partial<ReminderQuery> = {}) => ['reminders', 'list', q] as const,
  },
  watchlist: {
    all: ['watchlist'] as const,
    list: (q: Partial<WatchlistQuery> = {}) => ['watchlist', 'list', q] as const,
    counts: () => ['watchlist', 'counts'] as const,
  },
  messages: {
    all: ['messages'] as const,
    list: (q: Partial<MessageLogQuery> = {}) => ['messages', 'list', q] as const,
    stats: () => ['messages', 'stats'] as const,
  },
};
