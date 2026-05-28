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
import { KIND_LABEL } from '@/lib/watchlist-ui';
import { WATCHLIST_KINDS } from '@/lib/types';

export default function NuevoWatchlistPage() {
  const [kind, setKind] = useState('movie');

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success('Añadido a la watchlist', { description: '(mockup, no persiste en base de datos)' });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/watchlist" />}>
        <ArrowLeft /> Volver a watchlist
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nueva entrada</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="kind">Tipo</Label>
              <Select value={kind} onValueChange={(v) => setKind(v ?? 'movie')}>
                <SelectTrigger id="kind" className="w-full">
                  <SelectValue>
                    {(v) => (v ? KIND_LABEL[v as (typeof WATCHLIST_KINDS)[number]] : '')}
                  </SelectValue>
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
              <Input id="title" placeholder="Ej: Dune: Parte Dos" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="url">Enlace (opcional)</Label>
              <Input id="url" type="url" placeholder="https://…" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input id="notes" placeholder="Ej: recomendada por Dani" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" render={<Link href="/watchlist" />}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
