import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
  CreateExpenseInput,
  Expense,
  ExpenseQuery,
  ExpenseSummaryPeriod,
  UpdateExpenseInput,
} from '@alice/shared';

import { messageFromError, useOptimisticListMutation } from '@/lib/optimistic-mutation';
import { queryKeys } from '@/lib/query-keys';
import { expensesService } from '@/services/expenses.service';

// ---------- QUERIES ----------

export function useExpensesList(q: Partial<ExpenseQuery> = {}, opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.expenses.list(q),
    queryFn: () => expensesService.list(q),
    enabled: opts?.enabled ?? true,
  });
}

export function useExpensesSummary(period: ExpenseSummaryPeriod = 'month') {
  return useQuery({
    queryKey: queryKeys.expenses.summary(period),
    queryFn: () => expensesService.summary(period),
  });
}

export function useExpense(id: number, opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.expenses.detail(id),
    queryFn: () => expensesService.get(id),
    enabled: (opts?.enabled ?? true) && id > 0,
  });
}

// ---------- MUTATIONS ----------

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => expensesService.create(input),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: queryKeys.expenses.all });
      toast.success(`Gasto #${created.id} registrado`);
    },
    onError: (err) => toast.error(messageFromError(err, 'No se pudo registrar el gasto')),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateExpenseInput }) =>
      expensesService.update(id, input),
    onSuccess: async (updated) => {
      await qc.invalidateQueries({ queryKey: queryKeys.expenses.all });
      toast.success(`Gasto #${updated.id} actualizado`);
    },
    onError: (err) => toast.error(messageFromError(err, 'No se pudo actualizar')),
  });
}

export function useDeleteExpense() {
  return useOptimisticListMutation<{ id: number; deleted: true }, number, Expense>({
    mutationFn: (id) => expensesService.remove(id),
    listKeyPrefix: ['expenses', 'list'],
    invalidateKey: queryKeys.expenses.all,
    applyOptimistic: (list, id) => list.filter((e) => e.id !== id),
    successToast: (_data, id) => `Gasto #${id} borrado`,
    errorToast: (err) => messageFromError(err, 'No se pudo borrar el gasto'),
  });
}
