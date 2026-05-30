import { useMemo, useState } from 'react';
import { Bell, Check, Pencil, X } from 'lucide-react';
import { es } from 'react-day-picker/locale';

import { EditReminderDialog } from '@/components/dialogs/edit-reminder-dialog';
import { useUndoableDelete } from '@/lib/use-undoable-delete';
import { queryKeys } from '@/lib/query-keys';
import { remindersService } from '@/services/reminders.service';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dateKey, limaDate } from '@/lib/date-utils';
import { formatDate, formatRelative, formatTime } from '@/lib/format';
import type { Reminder } from '@/lib/types';
import { cn } from '@/lib/utils';

export function RemindersView({ reminders, nowIso }: { reminders: Reminder[]; nowIso: string }) {
  const undoableDelete = useUndoableDelete();
  const now = new Date(nowIso);
  const in24h = now.getTime() + 86_400_000;
  const today = limaDate(nowIso);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [toEdit, setToEdit] = useState<Reminder | null>(null);

  const pending = reminders
    .filter((r) => !r.sent)
    .sort((a, b) => a.fireAt.localeCompare(b.fireAt));
  const sent = reminders.filter((r) => r.sent).sort((a, b) => b.fireAt.localeCompare(a.fireAt));

  const remindersByDay = useMemo(() => {
    const map = new Map<string, Reminder[]>();
    for (const r of reminders) {
      const key = dateKey(limaDate(r.fireAt));
      const existing = map.get(key);
      if (existing) existing.push(r);
      else map.set(key, [r]);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.fireAt.localeCompare(b.fireAt));
    return map;
  }, [reminders]);

  const reminderDays = useMemo(
    () => [...remindersByDay.keys()].map((k) => {
      const [y, m, d] = k.split('-').map(Number);
      return new Date(y!, m! - 1, d!);
    }),
    [remindersByDay],
  );

  const dayReminders = remindersByDay.get(dateKey(selectedDate)) ?? [];

  const longDateRaw = selectedDate.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const longDate = longDateRaw.charAt(0).toUpperCase() + longDateRaw.slice(1);
  const isToday = dateKey(selectedDate) === dateKey(today);


  return (
    <Tabs defaultValue="list" className="flex-col gap-4">
      <TabsList>
        <TabsTrigger value="list">Lista</TabsTrigger>
        <TabsTrigger value="calendar">Calendario</TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Pendientes · {pending.length}
          </h2>
          <div className="flex flex-col gap-2">
            {pending.map((r) => {
              const soon = new Date(r.fireAt).getTime() <= in24h;
              return (
                <div
                  key={r.id}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-foreground/20',
                    soon && 'border-l-2 border-l-amber-500',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full',
                      soon ? 'bg-amber-500/15 text-amber-500' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Bell className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(r.fireAt)} · {formatRelative(r.fireAt, now)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-sm font-medium tabular-nums">{formatTime(r.fireAt)}</span>
                    {soon && (
                      <Badge variant="secondary" className="mt-0.5 text-amber-500">
                        próx. 24 h
                      </Badge>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar"
                      onClick={() => setToEdit(r)}
                    >
                      <Pencil className="text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Cancelar"
                      onClick={() => {
                        void undoableDelete<number, Reminder>({
                          vars: r.id,
                          listKeyPrefix: ['reminders', 'list'],
                          invalidateKey: queryKeys.reminders.all,
                          applyOptimistic: (list, id) => list.filter((x) => x.id !== id),
                          mutationFn: (id) => remindersService.remove(id),
                          successMessage: `Recordatorio #${r.id} cancelado`,
                        });
                      }}
                    >
                      <X className="text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {pending.length === 0 && (
              <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                No hay recordatorios pendientes.
              </div>
            )}
          </div>
        </section>

        {sent.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Enviados · {sent.length}
            </h2>
            <div className="divide-y overflow-hidden rounded-xl border">
              {sent.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Check className="size-4 shrink-0 text-emerald-500/70" />
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    {r.text}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatDate(r.fireAt)} · {formatTime(r.fireAt)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </TabsContent>

      <TabsContent value="calendar">
        <div className="grid gap-4 md:grid-cols-[auto_1fr]">
          <Card className="w-fit">
            <CardContent className="p-3">
              <Calendar
                locale={es}
                mode="single"
                required
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                defaultMonth={selectedDate}
                modifiers={{ reminder: reminderDays }}
                modifiersClassNames={{
                  reminder: 'font-bold text-amber-500',
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle>
                    {longDate}
                    {isToday && (
                      <Badge variant="secondary" className="ml-2 align-middle">
                        Hoy
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {dayReminders.length === 0
                      ? 'Sin recordatorios este día.'
                      : `${dayReminders.length} ${dayReminders.length === 1 ? 'recordatorio' : 'recordatorios'}`}
                  </CardDescription>
                </div>
                {!isToday && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate(today)}>
                    Ir a hoy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {dayReminders.length === 0 && (
                <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                  Elige otro día resaltado en el calendario.
                </div>
              )}
              {dayReminders.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border bg-card p-3',
                    r.sent && 'opacity-70',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full',
                      r.sent
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-amber-500/15 text-amber-500',
                    )}
                  >
                    {r.sent ? <Check className="size-4" /> : <Bell className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.sent ? 'Enviado' : 'Pendiente'}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatTime(r.fireAt)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <EditReminderDialog
        reminder={toEdit}
        onOpenChange={(open) => !open && setToEdit(null)}
      />
    </Tabs>
  );
}
