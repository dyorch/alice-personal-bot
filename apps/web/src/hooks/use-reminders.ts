import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
  CreateReminderInput,
  Reminder,
  ReminderQuery,
  UpdateReminderInput,
} from '@alice/shared';

import { messageFromError, useOptimisticListMutation } from '@/lib/optimistic-mutation';
import { queryKeys } from '@/lib/query-keys';
import { remindersService } from '@/services/reminders.service';

// ---------- QUERIES ----------

export function useRemindersList(q: Partial<ReminderQuery> = {}, opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.reminders.list(q),
    queryFn: () => remindersService.list(q),
    enabled: opts?.enabled ?? true,
  });
}

export function useReminder(id: number, opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.reminders.detail(id),
    queryFn: () => remindersService.get(id),
    enabled: (opts?.enabled ?? true) && id > 0,
  });
}

// ---------- MUTATIONS ----------

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReminderInput) => remindersService.create(input),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: queryKeys.reminders.all });
      toast.success(`Recordatorio #${created.id} creado`);
    },
    onError: (err) => toast.error(messageFromError(err, 'No se pudo crear el recordatorio')),
  });
}

export function useUpdateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateReminderInput }) =>
      remindersService.update(id, input),
    onSuccess: async (updated) => {
      await qc.invalidateQueries({ queryKey: queryKeys.reminders.all });
      toast.success(`Recordatorio #${updated.id} actualizado`);
    },
    onError: (err) => toast.error(messageFromError(err, 'No se pudo actualizar')),
  });
}

export function useCancelReminder() {
  return useOptimisticListMutation<{ id: number; deleted: true }, number, Reminder>({
    mutationFn: (id) => remindersService.remove(id),
    listKeyPrefix: ['reminders', 'list'],
    invalidateKey: queryKeys.reminders.all,
    applyOptimistic: (list, id) => list.filter((r) => r.id !== id),
    successToast: (_data, id) => `Recordatorio #${id} cancelado`,
    errorToast: (err) => messageFromError(err, 'No se pudo cancelar el recordatorio'),
  });
}
