import { createFileRoute } from '@tanstack/react-router';

import { NewWatchlistPage } from '@/pages/new-watchlist-page';

export const Route = createFileRoute('/watchlist/new')({
  component: NewWatchlistPage,
});
