import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExpenseForm } from '@/components/forms/expense-form';
import { useUpdateExpense } from '@/hooks/use-expenses';
import type { Expense } from '@/lib/types';

interface Props {
  expense: Expense | null;
  onOpenChange: (open: boolean) => void;
}

export function EditExpenseDialog({ expense, onOpenChange }: Props) {
  const update = useUpdateExpense();

  return (
    <Dialog open={expense !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar gasto {expense ? `#${expense.id}` : ''}</DialogTitle>
          <DialogDescription>Modifica los campos y guarda los cambios.</DialogDescription>
        </DialogHeader>
        {expense && (
          <ExpenseForm
            initial={{
              amount: expense.amount,
              currency: expense.currency,
              category: expense.category,
              description: expense.description,
              spentAt: expense.spentAt,
            }}
            isPending={update.isPending}
            submitLabel="Guardar cambios"
            onCancel={() => onOpenChange(false)}
            onSubmit={(input) =>
              update.mutate(
                { id: expense.id, input },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
