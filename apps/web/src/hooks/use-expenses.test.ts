import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Expense } from '@alice/shared';

import { renderHookWithClient } from '@/test/utils';

import { useDeleteExpense } from './use-expenses';

vi.mock('@/services/expenses.service', () => ({
  expensesService: {
    list: vi.fn(),
    summary: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { expensesService } from '@/services/expenses.service';

function makeExpense(id: number): Expense {
  return {
    id,
    amount: 10,
    currency: 'PEN',
    category: 'comida',
    description: `gasto ${id}`,
    spentAt: '2026-05-15',
    createdAt: '2026-05-15T12:00:00Z',
  } as Expense;
}

describe('useDeleteExpense', () => {
  it('aplica optimistic update sobre el cache de listas', async () => {
    vi.mocked(expensesService.remove).mockResolvedValue({ id: 2, deleted: true });

    const { result, client } = renderHookWithClient(() => useDeleteExpense());

    const list = [makeExpense(1), makeExpense(2), makeExpense(3)];
    const key = ['expenses', 'list', { limit: 500 }];
    client.setQueryData(key, list);

    result.current.mutate(2);

    // Tras onMutate, el cache debe reflejar la eliminación optimista.
    await waitFor(() => {
      const current = client.getQueryData<Expense[]>(key);
      expect(current?.map((e) => e.id)).toEqual([1, 3]);
    });

    // La mutation debe completarse exitosamente.
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(expensesService.remove).toHaveBeenCalledWith(2);
  });

  it('revierte el cache si la mutation falla', async () => {
    vi.mocked(expensesService.remove).mockRejectedValueOnce(new Error('falló'));

    const { result, client } = renderHookWithClient(() => useDeleteExpense());

    const list = [makeExpense(1), makeExpense(2)];
    const key = ['expenses', 'list', {}];
    client.setQueryData(key, list);

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isError).toBe(true));

    const restored = client.getQueryData<Expense[]>(key);
    expect(restored?.map((e) => e.id)).toEqual([1, 2]);
  });
});
