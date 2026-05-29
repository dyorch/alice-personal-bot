import { createFileRoute } from '@tanstack/react-router';

import { WatchlistPage } from '@/pages/watchlist-page';

export const Route = createFileRoute('/watchlist/')({
  component: WatchlistPage,
});
