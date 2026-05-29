import { createFileRoute } from '@tanstack/react-router';

import { RemindersPage } from '@/pages/reminders-page';
import { queryKeys } from '@/lib/query-keys';
import { remindersService } from '@/services/reminders.service';

export const Route = createFileRoute('/reminders/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: queryKeys.reminders.list({ status: 'all', limit: 500 }),
      queryFn: () => remindersService.list({ status: 'all', limit: 500 }),
    }),
  component: RemindersPage,
});
