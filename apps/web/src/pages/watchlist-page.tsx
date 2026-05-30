import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NewWatchlistDialog } from '@/components/dialogs/new-watchlist-dialog';
import { WatchlistView } from '@/components/watchlist-view';
import { useWatchlistList } from '@/hooks/use-watchlist';

export function WatchlistPage() {
  const [newOpen, setNewOpen] = useState(false);
  const itemsQuery = useWatchlistList({ status: 'all', limit: 500 });

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Pelis, series y enlaces para ver después.
        </p>
        <Button onClick={() => setNewOpen(true)}>
          <Plus /> Nuevo
        </Button>
      </div>
      {itemsQuery.data ? (
        <WatchlistView items={itemsQuery.data} />
      ) : (
        <Skeleton className="h-96" />
      )}

      <NewWatchlistDialog open={newOpen} onOpenChange={setNewOpen} />
    </>
  );
}
