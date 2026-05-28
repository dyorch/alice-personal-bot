import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { WatchlistView } from '@/components/watchlist-view';
import { listAllWatchlist } from '@/lib/data';

export default async function WatchlistPage() {
  const items = await listAllWatchlist();
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Pelis, series y enlaces para ver después.
        </p>
        <Button render={<Link href="/watchlist/nuevo" />}>
          <Plus /> Nuevo
        </Button>
      </div>
      <WatchlistView items={items} />
    </>
  );
}
