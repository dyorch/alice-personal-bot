import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApiError } from '@/lib/http';

export interface UndoableDeleteConfig<TVars, TList> {
  vars: TVars;
  /** Prefix de query keys cuyas listas en cache deben actualizarse. */
  listKeyPrefix: QueryKey;
  /** Prefix a invalidar tras commit definitivo. Default: listKeyPrefix. */
  invalidateKey?: QueryKey;
  /** Cómo se filtra la lista para reflejar el borrado optimista. */
  applyOptimistic: (list: TList[], vars: TVars) => TList[];
  /** IO real al servidor. Solo se llama si pasa el timer sin undo. */
  mutationFn: (vars: TVars) => Promise<unknown>;
  /** Mensaje del toast de éxito. */
  successMessage: string;
  /** Texto del botón de undo. Default: "Deshacer". */
  undoLabel?: string;
  /** Tiempo antes del commit definitivo, ms. Default 5000. */
  undoTimeoutMs?: number;
}

/**
 * Patrón "soft delete con undo": al invocarlo, el item desaparece de la
 * lista visualmente (optimistic) y aparece un toast con botón "Deshacer"
 * por unos segundos. Si el usuario hace undo, se revierte. Si no, se
 * confirma en el servidor.
 */
export function useUndoableDelete() {
  const qc = useQueryClient();

  return async function undoableDelete<TVars, TList>(
    cfg: UndoableDeleteConfig<TVars, TList>,
  ): Promise<void> {
    const timeoutMs = cfg.undoTimeoutMs ?? 5000;

    await qc.cancelQueries({ queryKey: cfg.listKeyPrefix });
    const snapshots = qc.getQueriesData<TList[]>({ queryKey: cfg.listKeyPrefix });
    snapshots.forEach(([key, list]) => {
      if (list) qc.setQueryData<TList[]>(key, cfg.applyOptimistic(list, cfg.vars));
    });

    let cancelled = false;
    const commit = setTimeout(() => {
      if (cancelled) return;
      void cfg
        .mutationFn(cfg.vars)
        .then(() => {
          void qc.invalidateQueries({
            queryKey: cfg.invalidateKey ?? cfg.listKeyPrefix,
          });
        })
        .catch((err) => {
          snapshots.forEach(([key, prev]) => qc.setQueryData(key, prev));
          const msg =
            err instanceof ApiError || err instanceof Error
              ? err.message
              : 'No se pudo completar el borrado';
          toast.error(msg);
        });
    }, timeoutMs);

    toast.success(cfg.successMessage, {
      action: {
        label: cfg.undoLabel ?? 'Deshacer',
        onClick: () => {
          cancelled = true;
          clearTimeout(commit);
          snapshots.forEach(([key, prev]) => qc.setQueryData(key, prev));
          toast.info('Borrado cancelado');
        },
      },
      duration: timeoutMs,
    });
  };
}
