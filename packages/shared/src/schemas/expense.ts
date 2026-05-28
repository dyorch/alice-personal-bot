import { z } from 'zod';

import { Currency, IsoDateTime, LocalDateString } from './common.js';

/** Registro tal como vive en D1 (filas devueltas por la API). */
export const Expense = z.object({
  id: z.number().int().positive(),
  amount: z.number().positive(),
  currency: Currency,
  category: z.string().min(1),
  description: z.string(),
  spentAt: LocalDateString,
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type Expense = z.infer<typeof Expense>;

export const CreateExpenseInput = z.object({
  amount: z.number().positive(),
  currency: Currency.default('PEN'),
  category: z.string().min(1).max(40),
  description: z.string().max(280).default(''),
  spentAt: LocalDateString.optional(),
});
export type CreateExpenseInput = z.infer<typeof CreateExpenseInput>;

export const UpdateExpenseInput = CreateExpenseInput.partial();
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseInput>;

export const ExpenseQuery = z.object({
  from: LocalDateString.optional(),
  to: LocalDateString.optional(),
  category: z.string().optional(),
  currency: Currency.optional(),
  limit: z.coerce.number().int().positive().max(500).default(100),
  offset: z.coerce.number().int().nonnegative().default(0),
});
export type ExpenseQuery = z.infer<typeof ExpenseQuery>;

export const ExpenseSummaryPeriod = z.enum(['day', 'week', 'month']);
export type ExpenseSummaryPeriod = z.infer<typeof ExpenseSummaryPeriod>;

export const ExpenseSummary = z.object({
  period: ExpenseSummaryPeriod,
  from: LocalDateString,
  to: LocalDateString,
  totalsByCurrency: z.array(
    z.object({
      currency: Currency,
      total: z.number(),
      count: z.number().int().nonnegative(),
    }),
  ),
  byCategory: z.array(
    z.object({
      currency: Currency,
      category: z.string(),
      total: z.number(),
    }),
  ),
});
export type ExpenseSummary = z.infer<typeof ExpenseSummary>;
