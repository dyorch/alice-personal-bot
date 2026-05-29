import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApiError } from '@/lib/http';

export interface OptimisticListMutationConfig<TData, TVars, TList> {
  /** Función IO: ejecuta el cambio en el server. */
  mutationFn: (vars: TVars) => Promise<TData>;
  /** Prefix de query key para snapshot + invalidate. Ej: ['expenses', 'list']. */
  listKeyPrefix: QueryKey;
  /** Prefix amplio a invalidar al final. Default: listKeyPrefix. */
  invalidateKey?: QueryKey;
  /** Transforma cada lista del cache aplicando el cambio optimista. */
  applyOptimistic: (list: TList[], vars: TVars) => TList[];
  /** Mensaje del toast de éxito. Si retorna falsy, no se muestra toast. */
  successToast?: (data: TData, vars: TVars) => string | null | undefined;
  /** Mensaje del toast de error. Default: usa el mensaje del error. */
  errorToast?: (err: unknown, vars: TVars) => string;
}

type MutationContext<TList> = { snapshots: [QueryKey, TList[] | undefined][] };

/**
 * Helper para mutaciones optimistas sobre listas en cache. Hace snapshot de
 * todas las queries que matcheen `listKeyPrefix`, aplica `applyOptimistic`,
 * revierte en error, invalida al final.
 */
export function useOptimisticListMutation<TData, TVars, TList>(
  cfg: OptimisticListMutationConfig<TData, TVars, TList>,
  extra?: Omit<
    UseMutationOptions<TData, unknown, TVars, MutationContext<TList>>,
    'mutationFn' | 'onMutate' | 'onError' | 'onSettled' | 'onSuccess'
  >,
) {
  const qc = useQueryClient();
  return useMutation<TData, unknown, TVars, MutationContext<TList>>({
    ...extra,
    mutationFn: cfg.mutationFn,
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: cfg.listKeyPrefix });
      const snapshots = qc.getQueriesData<TList[]>({ queryKey: cfg.listKeyPrefix });
      snapshots.forEach(([key, list]) => {
        if (list) qc.setQueryData<TList[]>(key, cfg.applyOptimistic(list, vars));
      });
      return { snapshots };
    },
    onError: (err, vars, ctx) => {
      ctx?.snapshots.forEach(([key, prev]) => qc.setQueryData(key, prev));
      const msg = cfg.errorToast?.(err, vars) ?? messageFromError(err, 'Operación fallida');
      toast.error(msg);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: cfg.invalidateKey ?? cfg.listKeyPrefix });
    },
    onSuccess: (data, vars) => {
      const msg = cfg.successToast?.(data, vars);
      if (msg) toast.success(msg);
    },
  });
}

export function messageFromError(err: unknown, fallback: string): string {
  if (err instanceof ApiError || err instanceof Error) return err.message;
  return fallback;
}
