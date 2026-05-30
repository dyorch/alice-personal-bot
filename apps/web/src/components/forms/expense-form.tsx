import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EXPENSE_CATEGORIES } from '@/lib/derived';
import type { Currency } from '@/lib/types';
import type { CreateExpenseInput } from '@alice/shared';

interface ExpenseFormProps {
  initial?: {
    amount: number;
    currency: Currency;
    category: string;
    description: string;
    spentAt: string;
  };
  isPending?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (input: CreateExpenseInput) => void;
}

export function ExpenseForm({
  initial,
  isPending = false,
  submitLabel = 'Registrar gasto',
  onCancel,
  onSubmit,
}: ExpenseFormProps) {
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'PEN');
  const [category, setCategory] = useState<string>(
    initial?.category ?? EXPENSE_CATEGORIES[0],
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      amount: Number(fd.get('amount')),
      currency,
      category,
      description: String(fd.get('description') ?? ''),
      spentAt: String(fd.get('spentAt') ?? ''),
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Monto</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            defaultValue={initial?.amount}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select value={currency} onValueChange={(v) => setCurrency((v ?? 'PEN') as Currency)}>
            <SelectTrigger id="currency" className="w-full">
              <SelectValue>
                {(v) => (v === 'PEN' ? 'Soles (PEN)' : 'Dólares (USD)')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PEN">Soles (PEN)</SelectItem>
              <SelectItem value="USD">Dólares (USD)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Categoría</Label>
        <Select value={category} onValueChange={(v) => setCategory(v ?? EXPENSE_CATEGORIES[0])}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue>{(v) => <span className="capitalize">{v}</span>}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          name="description"
          placeholder="Ej: almuerzo con Dani"
          defaultValue={initial?.description}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="spentAt">Fecha</Label>
        <Input
          id="spentAt"
          name="spentAt"
          type="date"
          defaultValue={initial?.spentAt}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
