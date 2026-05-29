import { createFileRoute } from '@tanstack/react-router';

import { ActivityPage } from '@/pages/activity-page';
import { queryKeys } from '@/lib/query-keys';
import { messagesService } from '@/services/messages.service';

export const Route = createFileRoute('/activity')({
  loader: ({ context }) => {
    const { queryClient } = context;
    return Promise.all([
      queryClient.ensureQueryData({
        queryKey: queryKeys.messages.list({ limit: 200 }),
        queryFn: () => messagesService.list({ limit: 200 }),
      }),
      queryClient.ensureQueryData({
        queryKey: queryKeys.messages.stats(),
        queryFn: () => messagesService.stats(),
      }),
    ]);
  },
  component: ActivityPage,
});
