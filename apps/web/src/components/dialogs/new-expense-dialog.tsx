import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExpenseForm } from '@/components/forms/expense-form';
import { useCreateExpense } from '@/hooks/use-expenses';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewExpenseDialog({ open, onOpenChange }: Props) {
  const create = useCreateExpense();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo gasto</DialogTitle>
          <DialogDescription>Registra un gasto en soles o dólares.</DialogDescription>
        </DialogHeader>
        {open && (
          <ExpenseForm
            isPending={create.isPending}
            submitLabel="Registrar gasto"
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
