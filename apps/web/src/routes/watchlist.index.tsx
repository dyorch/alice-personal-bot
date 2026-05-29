import { createFileRoute } from '@tanstack/react-router';

import { WatchlistPage } from '@/pages/watchlist-page';
import { queryKeys } from '@/lib/query-keys';
import { watchlistService } from '@/services/watchlist.service';

export const Route = createFileRoute('/watchlist/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: queryKeys.watchlist.list({ status: 'all', limit: 500 }),
      queryFn: () => watchlistService.list({ status: 'all', limit: 500 }),
    }),
  component: WatchlistPage,
});
