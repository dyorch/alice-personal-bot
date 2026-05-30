import { type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ReminderFormValue {
  text: string;
  /** "YYYY-MM-DD" en hora local del usuario. */
  date: string;
  /** "HH:mm" 24h. */
  time: string;
}

interface ReminderFormProps {
  initial?: ReminderFormValue;
  isPending?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  /** Recibe fireAt en ISO UTC ya convertido + text. */
  onSubmit: (input: { text: string; fireAt: string }) => void;
}

export function ReminderForm({
  initial,
  isPending = false,
  submitLabel = 'Crear recordatorio',
  onCancel,
  onSubmit,
}: ReminderFormProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const date = String(fd.get('date'));
    const time = String(fd.get('time'));
    const text = String(fd.get('text'));
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    // Asume que el navegador está en la TZ del usuario (Lima).
    const local = new Date(y!, m! - 1, d!, hh!, mm!);
    onSubmit({ text, fireAt: local.toISOString() });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="text">¿Qué quieres recordar?</Label>
        <Input
          id="text"
          name="text"
          placeholder="Ej: pagar el recibo de luz"
          defaultValue={initial?.text}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={initial?.date}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="time">Hora (Lima)</Label>
          <Input
            id="time"
            name="time"
            type="time"
            defaultValue={initial?.time ?? '09:00'}
            required
          />
        </div>
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
