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
import { WATCHLIST_KINDS } from '@/lib/types';
import type { WatchlistKind } from '@/lib/types';
import { KIND_LABEL } from '@/lib/watchlist-ui';

export interface WatchlistFormValue {
  kind: WatchlistKind;
  title: string;
  url: string;
  notes: string;
}

interface WatchlistFormProps {
  initial?: WatchlistFormValue;
  isPending?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (input: {
    kind: WatchlistKind;
    title?: string;
    url?: string;
    notes?: string;
  }) => void;
}

export function WatchlistForm({
  initial,
  isPending = false,
  submitLabel = 'Guardar',
  onCancel,
  onSubmit,
}: WatchlistFormProps) {
  const [kind, setKind] = useState<WatchlistKind>(initial?.kind ?? 'movie');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const url = String(fd.get('url') ?? '').trim();
    const notes = String(fd.get('notes') ?? '').trim();
    const title = String(fd.get('title') ?? '').trim();
    onSubmit({
      kind,
      ...(title ? { title } : {}),
      ...(url ? { url } : {}),
      ...(notes ? { notes } : {}),
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="kind">Tipo</Label>
        <Select value={kind} onValueChange={(v) => setKind((v as WatchlistKind) ?? 'movie')}>
          <SelectTrigger id="kind" className="w-full">
            <SelectValue>{(v) => (v ? KIND_LABEL[v as WatchlistKind] : '')}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {WATCHLIST_KINDS.map((k) => (
              <SelectItem key={k} value={k}>
                {KIND_LABEL[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          placeholder="Ej: Dune: Parte Dos"
          defaultValue={initial?.title}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="url">Enlace (opcional)</Label>
        <Input
          id="url"
          name="url"
          type="url"
          placeholder="https://…"
          defaultValue={initial?.url}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Input
          id="notes"
          name="notes"
          placeholder="Ej: recomendada por Dani"
          defaultValue={initial?.notes}
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
