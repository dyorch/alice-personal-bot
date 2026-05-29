import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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
import { api, queryKeys } from '@/lib/api-client';
import type { CreateExpenseInput } from '@alice/shared';

const CATEGORIES = ['comida', 'transporte', 'super', 'ocio', 'salud', 'hogar', 'servicios', 'suscripciones'];

export function NewExpensePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [category, setCategory] = useState('comida');

  const create = useMutation({
    mutationFn: (input: CreateExpenseInput) => api.expenses.create(input),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      toast.success(`Gasto #${created.id} registrado`);
      navigate({ to: '/expenses' });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    },
  });

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
    create.mutate(input);
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
              <Select value={category} onValueChange={(v) => setCategory(v ?? 'comida')}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue>
                    {(v) => <span className="capitalize">{v}</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
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
