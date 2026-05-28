'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
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
import { EXPENSE_CATEGORIES } from '@/lib/mock-data';

export default function NuevoGastoPage() {
  const [currency, setCurrency] = useState('PEN');
  const [category, setCategory] = useState('comida');

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success('Gasto registrado', { description: '(mockup, no persiste en base de datos)' });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/gastos" />}>
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
                <Input id="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v ?? 'PEN')}>
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
              <Input id="description" placeholder="Ej: almuerzo con Dani" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="spentAt">Fecha</Label>
              <Input id="spentAt" type="date" defaultValue="2026-05-27" required />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" render={<Link href="/gastos" />}>
                Cancelar
              </Button>
              <Button type="submit">Registrar gasto</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
