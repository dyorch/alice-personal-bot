import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateExpense } from '@/hooks/use-expenses';
import { EXPENSE_CATEGORIES } from '@/lib/derived';
import type { CreateExpenseInput } from '@alice/shared';

export function NewExpensePage() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);

  const create = useCreateExpense();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const input: CreateExpenseInput = {
      amount: Number(fd.get('amount')),
      currency,
      category,
      description: String(fd.get('description') ?? ''),
      spentAt: String(fd.get('spentAt') ?? ''),
    };
    create.mutate(input, {
      onSuccess: () => navigate({ to: '/expenses' }),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" render={<Link to="/expenses" />}>
        <ArrowLeft /> Volver a gastos
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select value={currency} onValueChange={(v) => setCurrency((v ?? 'PEN') as 'PEN' | 'USD')}>
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
                  <SelectValue>
                    {(v) => <span className="capitalize">{v}</span>}
                  </SelectValue>
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
              <Input id="description" name="description" placeholder="Ej: almuerzo con Dani" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="spentAt">Fecha</Label>
              <Input id="spentAt" name="spentAt" type="date" required />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" render={<Link to="/expenses" />}>
                Cancelar
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Guardando…' : 'Registrar gasto'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
