'use client';

import { useTransition, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createReminder } from '@/lib/actions';

export default function NuevoRecordatorioPage() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const date = String(fd.get('date'));
    const time = String(fd.get('time'));
    const text = String(fd.get('text'));
    // Construye Date asumiendo que el navegador esta en la TZ del usuario (Lima).
    // Si el navegador esta en otra TZ, podria moverse la hora.
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    const local = new Date(y!, m! - 1, d!, hh!, mm!);
    const fireAt = local.toISOString();
    startTransition(async () => {
      try {
        const created = await createReminder({ text, fireAt });
        toast.success(`Recordatorio #${created.id} creado`);
        router.push('/recordatorios');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al crear');
      }
    });
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
              <Input id="text" name="text" placeholder="Ej: pagar el recibo de luz" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="time">Hora (Lima)</Label>
                <Input id="time" name="time" type="time" defaultValue="09:00" required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" render={<Link href="/recordatorios" />}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Guardando…' : 'Crear recordatorio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
