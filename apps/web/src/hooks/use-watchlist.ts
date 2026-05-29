import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
  CreateWatchlistInput,
  UpdateWatchlistInput,
  WatchlistItem,
  WatchlistQuery,
} from '@alice/shared';

import { messageFromError, useOptimisticListMutation } from '@/lib/optimistic-mutation';
import { queryKeys } from '@/lib/query-keys';
import { watchlistService } from '@/services/watchlist.service';

// ---------- QUERIES ----------

export function useWatchlistList(q: Partial<WatchlistQuery> = {}, opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.watchlist.list(q),
    queryFn: () => watchlistService.list(q),
    enabled: opts?.enabled ?? true,
  });
}

export function useWatchlistCounts() {
  return useQuery({
    queryKey: queryKeys.watchlist.counts(),
    queryFn: () => watchlistService.counts(),
  });
}

export function useWatchlistItem(id: number, opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.watchlist.detail(id),
    queryFn: () => watchlistService.get(id),
    enabled: (opts?.enabled ?? true) && id > 0,
  });
}

// ---------- MUTATIONS ----------

export function useCreateWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWatchlistInput) => watchlistService.create(input),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: queryKeys.watchlist.all });
      toast.success(`Anotado en la watchlist (#${created.id})`);
    },
    onError: (err) => toast.error(messageFromError(err, 'No se pudo guardar')),
  });
}

export function useUpdateWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateWatchlistInput }) =>
      watchlistService.update(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.watchlist.all });
    },
    onError: (err) => toast.error(messageFromError(err, 'No se pudo actualizar')),
  });
}

export function useToggleWatched() {
  return useOptimisticListMutation<
    WatchlistItem,
    { item: WatchlistItem; next: boolean },
    WatchlistItem
  >({
    mutationFn: ({ item, next }) => watchlistService.update(item.id, { watched: next }),
    listKeyPrefix: ['watchlist', 'list'],
    invalidateKey: queryKeys.watchlist.all,
    applyOptimistic: (list, { item, next }) =>
      list.map((x) =>
        x.id === item.id
          ? { ...x, watched: next, watchedAt: next ? new Date().toISOString() : null }
          : x,
      ),
    successToast: (_data, { next }) => (next ? 'Marcado como visto' : 'Movido a pendientes'),
    errorToast: (err) => messageFromError(err, 'No se pudo actualizar'),
  });
}
