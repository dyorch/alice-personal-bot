import { createFileRoute } from '@tanstack/react-router';

import { ExpensesPage } from '@/pages/expenses-page';
import { queryKeys } from '@/lib/query-keys';
import { expensesService } from '@/services/expenses.service';

export const Route = createFileRoute('/expenses/')({
  loader: ({ context }) => {
    const { queryClient } = context;
    return Promise.all([
      queryClient.ensureQueryData({
        queryKey: queryKeys.expenses.summary('month'),
        queryFn: () => expensesService.summary('month'),
      }),
      queryClient.ensureQueryData({
        queryKey: queryKeys.expenses.list({ limit: 500 }),
        queryFn: () => expensesService.list({ limit: 500 }),
      }),
    ]);
  },
  component: ExpensesPage,
});
