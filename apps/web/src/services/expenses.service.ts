import type {
  CreateExpenseInput,
  Expense,
  ExpenseQuery,
  ExpenseSummary,
  ExpenseSummaryPeriod,
  UpdateExpenseInput,
} from '@alice/shared';

import { http, qs } from '@/lib/http';

export const expensesService = {
  list: (q: Partial<ExpenseQuery> = {}) => http<Expense[]>(`/api/expenses${qs(q)}`),

  summary: (period: ExpenseSummaryPeriod) =>
    http<ExpenseSummary>(`/api/expenses/summary?period=${period}`),

  get: (id: number) => http<Expense>(`/api/expenses/${id}`),

  create: (input: CreateExpenseInput) =>
    http<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(input) }),

  update: (id: number, input: UpdateExpenseInput) =>
    http<Expense>(`/api/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),

  remove: (id: number) =>
    http<{ id: number; deleted: true }>(`/api/expenses/${id}`, { method: 'DELETE' }),
};
