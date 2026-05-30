import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WatchlistForm } from '@/components/forms/watchlist-form';
import { useUpdateWatchlist } from '@/hooks/use-watchlist';
import type { WatchlistItem } from '@/lib/types';

interface Props {
  item: WatchlistItem | null;
  onOpenChange: (open: boolean) => void;
}

export function EditWatchlistDialog({ item, onOpenChange }: Props) {
  const update = useUpdateWatchlist();

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar entrada {item ? `#${item.id}` : ''}</DialogTitle>
          <DialogDescription>Cambia el título, enlace, notas o tipo.</DialogDescription>
        </DialogHeader>
        {item && (
          <WatchlistForm
            initial={{
              kind: item.kind,
              title: item.title ?? '',
              url: item.url ?? '',
              notes: item.notes ?? '',
            }}
            isPending={update.isPending}
            submitLabel="Guardar cambios"
            onCancel={() => onOpenChange(false)}
            onSubmit={(input) =>
              update.mutate(
                { id: item.id, input },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
