import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReminderForm } from '@/components/forms/reminder-form';
import { useUpdateReminder } from '@/hooks/use-reminders';
import type { Reminder } from '@/lib/types';

/** Extrae "YYYY-MM-DD" y "HH:mm" desde un ISO UTC, convertido a hora Lima. */
function splitFireAtLima(isoUtc: string): { date: string; time: string } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts: Record<string, string> = {};
  for (const part of fmt.formatToParts(new Date(isoUtc))) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }
  const hour = parts.hour === '24' ? '00' : parts.hour!;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${hour}:${parts.minute}`,
  };
}

interface Props {
  reminder: Reminder | null;
  onOpenChange: (open: boolean) => void;
}

export function EditReminderDialog({ reminder, onOpenChange }: Props) {
  const update = useUpdateReminder();

  return (
    <Dialog open={reminder !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar recordatorio {reminder ? `#${reminder.id}` : ''}</DialogTitle>
          <DialogDescription>Cambia el texto o la fecha de aviso.</DialogDescription>
        </DialogHeader>
        {reminder && (
          <ReminderForm
            initial={{ text: reminder.text, ...splitFireAtLima(reminder.fireAt) }}
            isPending={update.isPending}
            submitLabel="Guardar cambios"
            onCancel={() => onOpenChange(false)}
            onSubmit={(input) =>
              update.mutate(
                { id: reminder.id, input },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
