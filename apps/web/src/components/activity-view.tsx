'use client';

import { useState } from 'react';
import { Search, ShieldAlert } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import type { MessageLogEntry, MessageLogStats, MessageStatus } from '@/lib/types';

const STATUS_LABEL: Record<MessageStatus, string> = {
  allowed: 'Permitido',
  rejected_unknown_sender: 'Número desconocido',
  rejected_invalid_signature: 'Firma inválida',
  rejected_rate_limit: 'Rate limit',
  sent: 'Enviado',
  failed: 'Falló',
};

function StatusBadge({ status }: { status: MessageStatus }) {
  const rejected = status.startsWith('rejected');
  return (
    <Badge
      variant={rejected ? 'destructive' : 'secondary'}
      className={cn(
        !rejected && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
      )}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function ActivityView({
  messages,
  stats,
}: {
  messages: MessageLogEntry[];
  stats: MessageLogStats;
}) {
  const [status, setStatus] = useState('all');
  const [sender, setSender] = useState('');
  const [selected, setSelected] = useState<MessageLogEntry | null>(null);

  const filtered = messages.filter((m) => {
    if (status === 'allowed' && m.status !== 'allowed') return false;
    if (status === 'rejected' && !m.status.startsWith('rejected')) return false;
    if (sender && !m.senderPhone.includes(sender)) return false;
    return true;
  });

  return (
    <>
      {stats.rejectionsLast24h > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <ShieldAlert className="size-5 shrink-0" />
          {stats.rejectionsLast24h} mensaje(s) rechazados en las últimas 24 h.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Recibidos hoy</CardDescription>
            <CardTitle className="text-2xl">{stats.receivedToday}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Rechazados hoy</CardDescription>
            <CardTitle className="text-2xl text-destructive">{stats.rejectedToday}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Números desconocidos (30 d)</CardDescription>
            <CardTitle className="text-2xl">{stats.distinctUnknownSenders30d}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por teléfono…"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v ?? 'all')}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado">
              {(v) =>
                v === 'all' ? 'Todos' : v === 'allowed' ? 'Permitidos' : 'Rechazados'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="allowed">Permitidos</SelectItem>
            <SelectItem value="rejected">Rechazados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Fecha / hora</TableHead>
              <TableHead className="w-32">Teléfono</TableHead>
              <TableHead className="w-28">Nombre</TableHead>
              <TableHead>Mensaje</TableHead>
              <TableHead className="w-40">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow
                key={m.id}
                onClick={() => setSelected(m)}
                className="cursor-pointer"
              >
                <TableCell className="text-muted-foreground tabular-nums">
                  {formatDateTime(m.createdAt)}
                </TableCell>
                <TableCell className="tabular-nums">{m.senderPhone || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{m.senderName ?? '—'}</TableCell>
                <TableCell className="max-w-0 truncate">{m.body.slice(0, 80)}</TableCell>
                <TableCell>
                  <StatusBadge status={m.status} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Sin mensajes para estos filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Detalle del mensaje</SheetTitle>
            <SheetDescription>Payload completo recibido del webhook (forensics).</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="flex flex-col gap-4 overflow-y-auto p-4 pt-0 text-sm">
              <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5">
                <dt className="text-muted-foreground">Estado</dt>
                <dd>
                  <StatusBadge status={selected.status} />
                </dd>
                <dt className="text-muted-foreground">Teléfono</dt>
                <dd className="tabular-nums">{selected.senderPhone || '—'}</dd>
                <dt className="text-muted-foreground">Nombre</dt>
                <dd>{selected.senderName ?? '—'}</dd>
                <dt className="text-muted-foreground">wa_message_id</dt>
                <dd className="break-all">{selected.waMessageId ?? '—'}</dd>
                <dt className="text-muted-foreground">Intent</dt>
                <dd>{selected.intent ?? '—'}</dd>
                {selected.rejectionReason && (
                  <>
                    <dt className="text-muted-foreground">Motivo</dt>
                    <dd className="text-destructive">{selected.rejectionReason}</dd>
                  </>
                )}
              </dl>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">raw_payload</p>
                <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 text-xs">
                  {selected.rawPayload}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
