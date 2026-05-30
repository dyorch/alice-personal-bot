import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReminderForm } from '@/components/forms/reminder-form';
import { useCreateReminder } from '@/hooks/use-reminders';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewReminderDialog({ open, onOpenChange }: Props) {
  const create = useCreateReminder();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo recordatorio</DialogTitle>
          <DialogDescription>Programa un aviso para tu número de WhatsApp.</DialogDescription>
        </DialogHeader>
        {open && (
          <ReminderForm
            isPending={create.isPending}
            submitLabel="Crear recordatorio"
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
