import { describe, expect, it } from 'vitest';

import type { Expense, ExpenseSummary, Reminder } from '@alice/shared';

import {
  categoryTotalsFromSummary,
  dailyTotalsFromList,
  deriveMonthSummary,
  topCategoriesFromSummary,
  upcomingReminders,
} from './derived';

function expense(over: Partial<Expense> = {}): Expense {
  return {
    id: 1,
    amount: 10,
    currency: 'PEN',
    category: 'comida',
    description: 'test',
    spentAt: '2026-05-15',
    createdAt: '2026-05-15T12:00:00Z',
    ...over,
  } as Expense;
}

const baseSummary: ExpenseSummary = {
  from: '2026-05-01',
  to: '2026-05-31',
  totalsByCurrency: [
    { currency: 'PEN', total: 500, count: 5 },
    { currency: 'USD', total: 30, count: 1 },
  ],
  byCategory: [
    { category: 'comida', currency: 'PEN', total: 200, count: 2 },
    { category: 'transporte', currency: 'PEN', total: 150, count: 2 },
    { category: 'ocio', currency: 'PEN', total: 150, count: 1 },
    { category: 'ocio', currency: 'USD', total: 30, count: 1 },
  ],
};

describe('deriveMonthSummary', () => {
  it('calcula delta % vs mes anterior cuando hay datos previos', () => {
    const prev: Expense[] = [
      expense({ id: 10, amount: 100, currency: 'PEN' }),
      expense({ id: 11, amount: 100, currency: 'PEN' }),
    ];
    const m = deriveMonthSummary(baseSummary, prev);
    expect(m.penNow).toBe(500);
    expect(m.penPrev).toBe(200);
    expect(m.penDeltaPct).toBeCloseTo(150);
  });

  it('no divide por cero cuando el mes anterior fue 0', () => {
    const m = deriveMonthSummary(baseSummary, []);
    expect(m.penDeltaPct).toBe(0);
  });

  it('ignora gastos en USD para penPrev', () => {
    const prev: Expense[] = [
      expense({ id: 1, amount: 1000, currency: 'USD' }),
      expense({ id: 2, amount: 100, currency: 'PEN' }),
    ];
    const m = deriveMonthSummary(baseSummary, prev);
    expect(m.penPrev).toBe(100);
  });
});

describe('topCategoriesFromSummary', () => {
  it('filtra por moneda y ordena descendente', () => {
    const top = topCategoriesFromSummary(baseSummary, 3, 'PEN');
    expect(top).toEqual([
      { category: 'comida', total: 200 },
      { category: 'transporte', total: 150 },
      { category: 'ocio', total: 150 },
    ]);
  });

  it('respeta el limit', () => {
    expect(topCategoriesFromSummary(baseSummary, 1, 'PEN')).toHaveLength(1);
  });
});

describe('categoryTotalsFromSummary', () => {
  it('devuelve todas las categorías de una moneda, ordenadas', () => {
    const usd = categoryTotalsFromSummary(baseSummary, 'USD');
    expect(usd).toEqual([{ category: 'ocio', total: 30 }]);
  });
});

describe('dailyTotalsFromList', () => {
  it('agrupa por día y solo cuenta PEN', () => {
    const list: Expense[] = [
      expense({ id: 1, amount: 10, spentAt: '2026-05-01', currency: 'PEN' }),
      expense({ id: 2, amount: 15, spentAt: '2026-05-01', currency: 'PEN' }),
      expense({ id: 3, amount: 999, spentAt: '2026-05-01', currency: 'USD' }),
      expense({ id: 4, amount: 7.5, spentAt: '2026-05-03', currency: 'PEN' }),
    ];
    const daily = dailyTotalsFromList(list, 31);
    expect(daily).toHaveLength(31);
    expect(daily[0]).toEqual({ day: 1, total: 25 });
    expect(daily[1]).toEqual({ day: 2, total: 0 });
    expect(daily[2]).toEqual({ day: 3, total: 7.5 });
  });

  it('redondea a 2 decimales', () => {
    const list: Expense[] = [
      expense({ amount: 0.1, spentAt: '2026-05-01' }),
      expense({ amount: 0.2, spentAt: '2026-05-01' }),
    ];
    const daily = dailyTotalsFromList(list, 1);
    expect(daily[0]!.total).toBe(0.3);
  });
});

describe('upcomingReminders', () => {
  it('filtra los que vencen dentro de N días', () => {
    const now = new Date('2026-05-15T12:00:00Z').getTime();
    const reminders: Reminder[] = [
      { id: 1, text: 'mañana', fireAt: '2026-05-16T12:00:00Z', sent: false } as Reminder,
      { id: 2, text: 'en 5 días', fireAt: '2026-05-20T12:00:00Z', sent: false } as Reminder,
      { id: 3, text: 'en 30 días', fireAt: '2026-06-15T12:00:00Z', sent: false } as Reminder,
    ];
    const result = upcomingReminders(reminders, 7, now);
    expect(result.map((r) => r.id)).toEqual([1, 2]);
  });
});
