'use client';

import { useState, useTransition } from 'react';
import { Check, ExternalLink, RotateCcw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api-client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import { KIND_ACCENT, KIND_ICON, KIND_LABEL } from '@/lib/watchlist-ui';
import type { WatchlistItem, WatchlistKind } from '@/lib/types';

const KINDS: WatchlistKind[] = ['movie', 'series', 'tiktok', 'video', 'other'];

function ItemCard({
  item,
  onToggle,
}: {
  item: WatchlistItem;
  onToggle: (item: WatchlistItem) => void;
}) {
  const Icon = KIND_ICON[item.kind];
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-foreground/20">
      <div
        className={cn(
          'relative flex h-24 items-center justify-center bg-gradient-to-br',
          KIND_ACCENT[item.kind],
        )}
      >
        <Icon className="size-9 opacity-80" />
        <Badge variant="secondary" className="absolute top-2 left-2 gap-1 backdrop-blur">
          <Icon className="size-3" />
          {KIND_LABEL[item.kind]}
        </Badge>
        {item.watched && (
          <Badge className="absolute top-2 right-2 gap-1 border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
            <Check className="size-3" /> Visto
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 leading-snug font-medium">{item.title}</p>
        </div>
        <p className="text-xs text-muted-foreground">Añadido el {formatDate(item.createdAt)}</p>
        {item.notes && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.notes}</p>
        )}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="size-3 shrink-0" />
            <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
          </a>
        )}
        <div className="mt-auto pt-3">
          <Button
            variant={item.watched ? 'ghost' : 'outline'}
            size="sm"
            className="w-full"
            onClick={() => onToggle(item)}
          >
            {item.watched ? (
              <>
                <RotateCcw /> Quitar de vistos
              </>
            ) : (
              <>
                <Check /> Marcar como visto
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WatchlistView({ items }: { items: WatchlistItem[] }) {
  const [list, setList] = useState(items);
  const [kind, setKind] = useState('all');
  const [search, setSearch] = useState('');
  const [, startTransition] = useTransition();
  const queryClient = useQueryClient();

  function toggle(item: WatchlistItem) {
    const next = !item.watched;
    setList((prev) =>
      prev.map((x) =>
        x.id === item.id
          ? { ...x, watched: next, watchedAt: next ? new Date().toISOString() : null }
          : x,
      ),
    );
    startTransition(async () => {
      try {
        await api.watchlist.update(item.id, { watched: next });
        await queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
        toast.success(next ? 'Marcado como visto' : 'Movido a pendientes');
      } catch (err) {
        setList((prev) =>
          prev.map((x) => (x.id === item.id ? item : x)),
        );
        toast.error(err instanceof Error ? err.message : 'No se pudo actualizar');
      }
    });
  }

  const matches = (i: WatchlistItem) =>
    (kind === 'all' || i.kind === kind) &&
    (!search || (i.title ?? '').toLowerCase().includes(search.toLowerCase()));

  const pending = list.filter((i) => !i.watched && matches(i));
  const watched = list.filter((i) => i.watched && matches(i));

  const grid = (data: WatchlistItem[], empty: string) =>
    data.length === 0 ? (
      <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {data.map((i) => (
          <ItemCard key={i.id} item={i} onToggle={toggle} />
        ))}
      </div>
    );

  return (
    <Tabs defaultValue="pending" className="flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TabsList>
          <TabsTrigger value="pending">Pendientes ({pending.length})</TabsTrigger>
          <TabsTrigger value="watched">Vistos ({watched.length})</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative min-w-44">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar título…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={kind} onValueChange={(v) => setKind(v ?? 'all')}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tipo">
                {(v) => (v === 'all' ? 'Todos' : KIND_LABEL[v as WatchlistKind])}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TabsContent value="pending">{grid(pending, 'No hay pendientes con estos filtros.')}</TabsContent>
      <TabsContent value="watched">{grid(watched, 'Aún no marcas nada como visto.')}</TabsContent>
    </Tabs>
  );
}
