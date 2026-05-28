import type {
  CreateExpenseInput,
  Currency,
  Expense,
  ExpenseQuery,
  ExpenseSummary,
  ExpenseSummaryPeriod,
  UpdateExpenseInput,
} from '@alice/shared';

import { type Db, nowIso } from '../client.js';
import { todayInTz } from '../../utils/time.js';

export function expenseRepo(db: Db) {
  return {
    async create(input: CreateExpenseInput, tz: string): Promise<Expense> {
      const spentAt = input.spentAt ?? todayInTz(tz);
      const now = nowIso();
      const row = await db
        .insertInto('expenses')
        .values({
          amount: input.amount,
          currency: input.currency,
          category: input.category,
          description: input.description,
          spentAt,
          createdAt: now,
          updatedAt: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return row as Expense;
    },

    async list(q: ExpenseQuery): Promise<Expense[]> {
      let query = db.selectFrom('expenses').selectAll();
      if (q.from) query = query.where('spentAt', '>=', q.from);
      if (q.to) query = query.where('spentAt', '<=', q.to);
      if (q.category) query = query.where('category', '=', q.category);
      if (q.currency) query = query.where('currency', '=', q.currency);
      const rows = await query
        .orderBy('spentAt', 'desc')
        .orderBy('id', 'desc')
        .limit(q.limit)
        .offset(q.offset)
        .execute();
      return rows as Expense[];
    },

    async get(id: number): Promise<Expense | null> {
      const row = await db
        .selectFrom('expenses')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();
      return (row as Expense | undefined) ?? null;
    },

    async update(id: number, input: UpdateExpenseInput): Promise<Expense | null> {
      const values: Record<string, unknown> = { updatedAt: nowIso() };
      if (input.amount !== undefined) values.amount = input.amount;
      if (input.currency !== undefined) values.currency = input.currency;
      if (input.category !== undefined) values.category = input.category;
      if (input.description !== undefined) values.description = input.description;
      if (input.spentAt !== undefined) values.spentAt = input.spentAt;
      const row = await db
        .updateTable('expenses')
        .set(values)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst();
      return (row as Expense | undefined) ?? null;
    },

    async remove(id: number): Promise<boolean> {
      const result = await db
        .deleteFrom('expenses')
        .where('id', '=', id)
        .executeTakeFirst();
      return Number(result.numDeletedRows ?? 0n) > 0;
    },

    async summary(period: ExpenseSummaryPeriod, tz: string): Promise<ExpenseSummary> {
      const today = todayInTz(tz);
      const range = computeRange(period, today);
      const rows = await db
        .selectFrom('expenses')
        .selectAll()
        .where('spentAt', '>=', range.from)
        .where('spentAt', '<=', range.to)
        .execute();

      const totalsMap = new Map<Currency, { total: number; count: number }>();
      const catMap = new Map<string, number>();
      for (const r of rows) {
        const cur = r.currency;
        const t = totalsMap.get(cur) ?? { total: 0, count: 0 };
        t.total += r.amount;
        t.count += 1;
        totalsMap.set(cur, t);
        const key = `${cur}:${r.category}`;
        catMap.set(key, (catMap.get(key) ?? 0) + r.amount);
      }

      return {
        period,
        from: range.from,
        to: range.to,
        totalsByCurrency: [...totalsMap.entries()].map(([currency, v]) => ({ currency, ...v })),
        byCategory: [...catMap.entries()].map(([key, total]) => {
          const [currency, category] = key.split(':') as [Currency, string];
          return { currency, category, total };
        }),
      };
    },
  };
}

function computeRange(period: ExpenseSummaryPeriod, today: string): { from: string; to: string } {
  if (period === 'day') return { from: today, to: today };
  if (period === 'month') {
    const month = today.slice(0, 7);
    return { from: `${month}-01`, to: today };
  }
  // week — lunes a hoy
  const [y, m, d] = today.split('-').map(Number);
  const noonUtc = new Date(Date.UTC(y!, m! - 1, d!, 12));
  const weekday = noonUtc.getUTCDay() || 7;
  const monday = new Date(noonUtc.getTime() - (weekday - 1) * 86_400_000);
  return { from: monday.toISOString().slice(0, 10), to: today };
}
