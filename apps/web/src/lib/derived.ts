import type { Currency, Expense, ExpenseSummary, Reminder } from '@alice/shared';

export const EXPENSE_CATEGORIES = [
  'comida',
  'transporte',
  'super',
  'ocio',
  'salud',
  'hogar',
  'servicios',
  'suscripciones',
] as const;

export interface CurrencyTotal {
  currency: Currency;
  total: number;
  count: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface DailyTotal {
  day: number;
  total: number;
}

export interface MonthSummary {
  totalsByCurrency: CurrencyTotal[];
  penNow: number;
  penPrev: number;
  penDeltaPct: number;
}

/** Deriva el resumen del mes con delta % vs mes anterior (solo PEN). */
export function deriveMonthSummary(
  currentSummary: ExpenseSummary,
  prevList: Expense[],
): MonthSummary {
  const penNow = currentSummary.totalsByCurrency.find((t) => t.currency === 'PEN')?.total ?? 0;
  const penPrev = prevList
    .filter((e) => e.currency === 'PEN')
    .reduce((s, e) => s + e.amount, 0);
  const penDeltaPct = penPrev === 0 ? 0 : ((penNow - penPrev) / penPrev) * 100;
  return { totalsByCurrency: currentSummary.totalsByCurrency, penNow, penPrev, penDeltaPct };
}

export function topCategoriesFromSummary(
  summary: ExpenseSummary,
  limit = 3,
  currency: Currency = 'PEN',
): CategoryTotal[] {
  return summary.byCategory
    .filter((c) => c.currency === currency)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map(({ category, total }) => ({ category, total }));
}

export function categoryTotalsFromSummary(
  summary: ExpenseSummary,
  currency: Currency,
): CategoryTotal[] {
  return summary.byCategory
    .filter((c) => c.currency === currency)
    .sort((a, b) => b.total - a.total)
    .map(({ category, total }) => ({ category, total }));
}

/** Totales por día del mes (1..N) sumando PEN. */
export function dailyTotalsFromList(
  expenses: Expense[],
  daysInMonth: number,
): DailyTotal[] {
  const totals = new Map<number, number>();
  for (const e of expenses) {
    if (e.currency !== 'PEN') continue;
    const day = Number(e.spentAt.slice(8, 10));
    totals.set(day, (totals.get(day) ?? 0) + e.amount);
  }
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return { day, total: Math.round((totals.get(day) ?? 0) * 100) / 100 };
  });
}

export function upcomingReminders(pending: Reminder[], days = 7, now = Date.now()): Reminder[] {
  const limit = now + days * 86_400_000;
  return pending.filter((r) => new Date(r.fireAt).getTime() <= limit);
}
