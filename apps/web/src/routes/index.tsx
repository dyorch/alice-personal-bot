import { createFileRoute } from '@tanstack/react-router';

import { HomePage } from '@/pages/home-page';
import { queryKeys } from '@/lib/query-keys';
import { expensesService } from '@/services/expenses.service';
import { messagesService } from '@/services/messages.service';
import { remindersService } from '@/services/reminders.service';
import { watchlistService } from '@/services/watchlist.service';

export const Route = createFileRoute('/')({
  loader: ({ context }) => {
    const { queryClient } = context;
    // Prefetch en paralelo las queries independientes. Las dependientes
    // (prevList, currentList) se disparan en la página tras tener summary.
    return Promise.all([
      queryClient.ensureQueryData({
        queryKey: queryKeys.expenses.summary('month'),
        queryFn: () => expensesService.summary('month'),
      }),
      queryClient.ensureQueryData({
        queryKey: queryKeys.reminders.list({ status: 'pending', limit: 500 }),
        queryFn: () => remindersService.list({ status: 'pending', limit: 500 }),
      }),
      queryClient.ensureQueryData({
        queryKey: queryKeys.watchlist.counts(),
        queryFn: () => watchlistService.counts(),
      }),
      queryClient.ensureQueryData({
        queryKey: queryKeys.watchlist.list({ status: 'pending', limit: 500 }),
        queryFn: () => watchlistService.list({ status: 'pending', limit: 500 }),
      }),
      queryClient.ensureQueryData({
        queryKey: queryKeys.messages.stats(),
        queryFn: () => messagesService.stats(),
      }),
    ]);
  },
  component: HomePage,
});
