import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { WatchlistView } from '@/components/watchlist-view';
import { useWatchlistList } from '@/hooks/use-watchlist';

export function WatchlistPage() {
  const itemsQuery = useWatchlistList({ status: 'all', limit: 500 });

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Pelis, series y enlaces para ver después.
        </p>
        <Button render={<Link to="/watchlist/new" />}>
          <Plus /> Nuevo
        </Button>
      </div>
      {itemsQuery.data ? (
        <WatchlistView items={itemsQuery.data} />
      ) : (
        <Skeleton className="h-96" />
      )}
    </>
  );
}
