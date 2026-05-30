import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WatchlistForm } from '@/components/forms/watchlist-form';
import { useCreateWatchlist } from '@/hooks/use-watchlist';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewWatchlistDialog({ open, onOpenChange }: Props) {
  const create = useCreateWatchlist();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva entrada</DialogTitle>
          <DialogDescription>Guarda una película, serie o enlace para ver después.</DialogDescription>
        </DialogHeader>
        {open && (
          <WatchlistForm
            isPending={create.isPending}
            submitLabel="Guardar"
            onCancel={() => onOpenChange(false)}
            onSubmit={(input) =>
              create.mutate(input, { onSuccess: () => onOpenChange(false) })
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
