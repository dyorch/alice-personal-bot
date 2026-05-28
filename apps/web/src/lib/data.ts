import 'server-only';

import type {
  Currency,
  Expense,
  MessageLogEntry,
  MessageLogStats,
  Reminder,
  WatchlistItem,
  WatchlistKind,
} from '@alice/shared';

import { api } from './api-client';

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

function previousMonthKey(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number);
  const d = new Date(Date.UTC(y!, m! - 1, 1));
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 7);
}

/** Resumen del mes actual con delta % vs mes anterior (solo PEN). */
export async function monthSummary(): Promise<MonthSummary> {
  const current = await api.expenses.summary('month');
  const currentMonth = current.from.slice(0, 7);
  const prevMonth = previousMonthKey(currentMonth);
  const prevList = await api.expenses.list({
    from: `${prevMonth}-01`,
    to: `${prevMonth}-31`,
    limit: 500,
  });
  const penNow = current.totalsByCurrency.find((t) => t.currency === 'PEN')?.total ?? 0;
  const penPrev = prevList
    .filter((e) => e.currency === 'PEN')
    .reduce((s, e) => s + e.amount, 0);
  const penDeltaPct = penPrev === 0 ? 0 : ((penNow - penPrev) / penPrev) * 100;
  return { totalsByCurrency: current.totalsByCurrency, penNow, penPrev, penDeltaPct };
}

export async function topCategories(limit = 3): Promise<CategoryTotal[]> {
  const summary = await api.expenses.summary('month');
  return summary.byCategory
    .filter((c) => c.currency === 'PEN')
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map(({ category, total }) => ({ category, total }));
}

export async function categoryTotals(currency: Currency): Promise<CategoryTotal[]> {
  const summary = await api.expenses.summary('month');
  return summary.byCategory
    .filter((c) => c.currency === currency)
    .sort((a, b) => b.total - a.total)
    .map(({ category, total }) => ({ category, total }));
}

/** Totales por dia del mes actual en PEN — para la grafica de barras. */
export async function dailyTotalsCurrentMonth(): Promise<DailyTotal[]> {
  const summary = await api.expenses.summary('month');
  const expensesList = await api.expenses.list({
    from: summary.from,
    to: summary.to,
    currency: 'PEN',
    limit: 500,
  });
  const daysInMonth = Number(summary.to.slice(8, 10));
  const totals = new Map<number, number>();
  for (const e of expensesList) {
    const day = Number(e.spentAt.slice(8, 10));
    totals.set(day, (totals.get(day) ?? 0) + e.amount);
  }
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return { day, total: Math.round((totals.get(day) ?? 0) * 100) / 100 };
  });
}

export async function listAllExpenses(): Promise<Expense[]> {
  return api.expenses.list({ limit: 500 });
}

export async function pendingReminders(): Promise<Reminder[]> {
  return api.reminders.list({ status: 'pending', limit: 500 });
}

export async function listAllReminders(): Promise<Reminder[]> {
  return api.reminders.list({ status: 'all', limit: 500 });
}

export async function upcomingReminders(days = 7): Promise<Reminder[]> {
  const pending = await pendingReminders();
  const limit = Date.now() + days * 86_400_000;
  return pending.filter((r) => new Date(r.fireAt).getTime() <= limit);
}

export async function watchlistPending(): Promise<WatchlistItem[]> {
  return api.watchlist.list({ status: 'pending', limit: 500 });
}

export async function listAllWatchlist(): Promise<WatchlistItem[]> {
  return api.watchlist.list({ status: 'all', limit: 500 });
}

export async function watchlistCountsByKind(): Promise<Record<WatchlistKind, number>> {
  return api.watchlist.counts();
}

export async function incomingMessages(): Promise<MessageLogEntry[]> {
  const all = await api.messages.list({ limit: 200 });
  return all.filter((m) => m.direction === 'in');
}

export async function messageLogStats(): Promise<MessageLogStats> {
  return api.messages.stats();
}

/** "Ahora" real — se usa en server components que pasan ISO al cliente. */
export function nowIso(): string {
  return new Date().toISOString();
}
