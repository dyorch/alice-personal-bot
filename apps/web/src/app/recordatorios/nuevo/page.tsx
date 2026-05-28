'use client';

import type { FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NuevoRecordatorioPage() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success('Recordatorio creado', { description: '(mockup, no persiste en base de datos)' });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/recordatorios" />}>
        <ArrowLeft /> Volver a recordatorios
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo recordatorio</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="text">¿Qué quieres recordar?</Label>
              <Input id="text" placeholder="Ej: pagar el recibo de luz" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" defaultValue="2026-06-01" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="time">Hora (Lima)</Label>
                <Input id="time" type="time" defaultValue="09:00" required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" render={<Link href="/recordatorios" />}>
                Cancelar
              </Button>
              <Button type="submit">Crear recordatorio</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
