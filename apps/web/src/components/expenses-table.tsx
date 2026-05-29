'use client';

import { useMemo, useState, useTransition } from 'react';
import { CalendarIcon, Download, Search, Trash2 } from 'lucide-react';
import { es } from 'react-day-picker/locale';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api-client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatDate, formatMoney } from '@/lib/format';
import type { Expense } from '@/lib/types';

type DatePreset = 'all' | 'today' | 'week' | 'month' | 'prevMonth' | 'custom';

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'all', label: 'Todas las fechas' },
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'prevMonth', label: 'Mes anterior' },
];

function limaDate(iso: string): Date {
  const [y, m, d] = new Date(iso)
    .toLocaleDateString('en-CA', { timeZone: 'America/Lima' })
    .split('-')
    .map(Number);
  return new Date(y!, m! - 1, d!);
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function presetRange(
  preset: DatePreset,
  now: Date,
  custom: DateRange | undefined,
): { from: string | null; to: string | null } {
  switch (preset) {
    case 'today': {
      const k = dateKey(now);
      return { from: k, to: k };
    }
    case 'week': {
      const day = now.getDay() || 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { from: dateKey(monday), to: dateKey(sunday) };
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: dateKey(first), to: dateKey(last) };
    }
    case 'prevMonth': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: dateKey(first), to: dateKey(last) };
    }
    case 'custom':
      return {
        from: custom?.from ? dateKey(custom.from) : null,
        to: custom?.to ? dateKey(custom.to) : null,
      };
    default:
      return { from: null, to: null };
  }
}

function shortDate(d: Date): string {
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export function ExpensesTable({
  expenses,
  nowIso,
}: {
  expenses: Expense[];
  nowIso: string;
}) {
  const now = useMemo(() => limaDate(nowIso), [nowIso]);
  const [rows, setRows] = useState(expenses);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [dateOpen, setDateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const [, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const categories = useMemo(
    () => [...new Set(expenses.map((e) => e.category))].sort(),
    [expenses],
  );

  const range = presetRange(datePreset, now, customRange);

  const filtered = rows.filter((e) => {
    if (category !== 'all' && e.category !== category) return false;
    if (currency !== 'all' && e.currency !== currency) return false;
    if (range.from && e.spentAt < range.from) return false;
    if (range.to && e.spentAt > range.to) return false;
    if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const dateLabel = (() => {
    if (datePreset !== 'custom') return PRESETS.find((p) => p.id === datePreset)?.label ?? '';
    if (customRange?.from && customRange?.to) {
      return `${shortDate(customRange.from)} – ${shortDate(customRange.to)}`;
    }
    if (customRange?.from) return `Desde ${shortDate(customRange.from)}`;
    return 'Personalizado';
  })();

  function pickPreset(p: DatePreset) {
    setDatePreset(p);
    setCustomRange(undefined);
    setDateOpen(false);
  }

  function onSelectRange(range: DateRange | undefined) {
    setCustomRange(range);
    setDatePreset('custom');
    if (range?.from && range?.to) setDateOpen(false);
  }

  function exportCsv() {
    const header = 'id,fecha,categoria,descripcion,monto,moneda';
    const lines = filtered.map(
      (e) => `${e.id},${e.spentAt},${e.category},"${e.description}",${e.amount},${e.currency}`,
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gastos.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  }

  function confirmDelete() {
    if (!toDelete) return;
    const item = toDelete;
    setToDelete(null);
    setRows((prev) => prev.filter((e) => e.id !== item.id));
    startTransition(async () => {
      try {
        await api.expenses.remove(item.id);
        await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
        toast.success(`Gasto #${item.id} borrado`);
      } catch (err) {
        setRows((prev) => [...prev, item].sort((a, b) => b.id - a.id));
        toast.error(err instanceof Error ? err.message : 'No se pudo borrar');
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-50 flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar en descripción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(datePreset === 'all' && 'text-muted-foreground')}
              />
            }
          >
            <CalendarIcon /> {dateLabel}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <div className="flex">
              <div className="flex w-44 flex-col gap-1 border-r p-2">
                {PRESETS.map((p) => (
                  <Button
                    key={p.id}
                    variant={datePreset === p.id ? 'secondary' : 'ghost'}
                    size="sm"
                    className="justify-start"
                    onClick={() => pickPreset(p.id)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <div className="p-2">
                <Calendar
                  locale={es}
                  mode="range"
                  selected={customRange}
                  onSelect={onSelectRange}
                  defaultMonth={new Date(2026, 4, 1)}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={category} onValueChange={(v) => setCategory(v ?? 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoría">
              {(v) =>
                v === 'all' ? 'Todas' : <span className="capitalize">{v}</span>
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={currency} onValueChange={(v) => setCurrency(v ?? 'all')}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Moneda">
              {(v) => (v === 'all' ? 'Ambas' : v === 'PEN' ? 'Soles' : 'Dólares')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Ambas</SelectItem>
            <SelectItem value="PEN">Soles</SelectItem>
            <SelectItem value="USD">Dólares</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCsv}>
          <Download /> Exportar CSV
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {formatDate(e.spentAt)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {e.category}
                  </Badge>
                </TableCell>
                <TableCell>{e.description}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatMoney(e.amount, e.currency)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Borrar"
                    onClick={() => setToDelete(e)}
                  >
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Sin gastos para estos filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrar gasto</DialogTitle>
            <DialogDescription>
              {toDelete &&
                `Se eliminará "${toDelete.description}" (${formatMoney(toDelete.amount, toDelete.currency)}). Esta acción no se puede deshacer.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Borrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
