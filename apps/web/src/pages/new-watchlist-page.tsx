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
import { KIND_LABEL } from '@/lib/watchlist-ui';
import { WATCHLIST_KINDS } from '@/lib/types';
import type { WatchlistKind } from '@/lib/types';
import type { CreateWatchlistInput } from '@alice/shared';

export function NewWatchlistPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<WatchlistKind>('movie');

  const create = useMutation({
    mutationFn: (input: CreateWatchlistInput) => api.watchlist.create(input),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
      toast.success(`Anotado en la watchlist (#${created.id})`);
      navigate({ to: '/watchlist' });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const url = String(fd.get('url') ?? '').trim();
    const notes = String(fd.get('notes') ?? '').trim();
    const title = String(fd.get('title') ?? '').trim();
    const input: CreateWatchlistInput = {
      kind,
      ...(title ? { title } : {}),
      ...(url ? { url } : {}),
      ...(notes ? { notes } : {}),
    };
    create.mutate(input);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit" render={<Link to="/watchlist" />}>
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
              <Select value={kind} onValueChange={(v) => setKind(((v as WatchlistKind) ?? 'movie'))}>
                <SelectTrigger id="kind" className="w-full">
                  <SelectValue>
                    {(v) => (v ? KIND_LABEL[v as WatchlistKind] : '')}
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
              <Input id="title" name="title" placeholder="Ej: Dune: Parte Dos" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="url">Enlace (opcional)</Label>
              <Input id="url" name="url" type="url" placeholder="https://…" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input id="notes" name="notes" placeholder="Ej: recomendada por Dani" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" render={<Link to="/watchlist" />}>
                Cancelar
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
