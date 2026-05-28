import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, ShieldAlert } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MonthlyBarChart } from '@/components/charts/monthly-bar-chart';
import { formatMoney, formatTime } from '@/lib/format';
import { KIND_ICON, KIND_LABEL } from '@/lib/watchlist-ui';
import {
  dailyTotalsCurrentMonth,
  messageLogStats,
  monthSummary,
  topCategories,
  upcomingReminders,
  watchlistCountsByKind,
  watchlistPending,
} from '@/lib/data';
import type { WatchlistKind } from '@/lib/types';

export default async function HomePage() {
  const [{ totalsByCurrency, penNow, penDeltaPct }, top, upcoming, counts, pending, stats, dailyTotals] =
    await Promise.all([
      monthSummary(),
      topCategories(3),
      upcomingReminders(7),
      watchlistCountsByKind(),
      watchlistPending(),
      messageLogStats(),
      dailyTotalsCurrentMonth(),
    ]);
  const usd = totalsByCurrency.find((t) => t.currency === 'USD');
  const deltaUp = penDeltaPct >= 0;
  const pendingCount = pending.length;

  return (
    <>
      {stats.rejectionsLast24h > 0 && (
        <Link
          href="/actividad"
          className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive transition-colors hover:bg-destructive/20"
        >
          <ShieldAlert className="size-5 shrink-0" />
          <span>
            <strong>{stats.rejectionsLast24h}</strong> mensaje(s) de números desconocidos fueron
            rechazados en las últimas 24 h. Ver actividad →
          </span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Gasto del mes</CardDescription>
            <CardTitle className="text-2xl">{formatMoney(penNow, 'PEN')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <span
              className={`inline-flex items-center gap-1 ${deltaUp ? 'text-destructive' : 'text-emerald-500'}`}
            >
              {deltaUp ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
              {Math.abs(penDeltaPct).toFixed(1)}% vs mes anterior
            </span>
            {usd && usd.total > 0 && (
              <span className="text-muted-foreground">
                + {formatMoney(usd.total, 'USD')} en dólares
              </span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Top categorías</CardDescription>
            <CardTitle className="text-base">Este mes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {top.length === 0 && <span className="text-muted-foreground">Sin gastos aún.</span>}
            {top.map((c, i) => (
              <div key={c.category} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  <span className="capitalize">{c.category}</span>
                </span>
                <span className="font-medium tabular-nums">{formatMoney(c.total, 'PEN')}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Próximos recordatorios</CardDescription>
            <CardTitle className="text-base">Siguientes 7 días</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {upcoming.length === 0 && (
              <span className="text-muted-foreground">Nada pendiente.</span>
            )}
            {upcoming.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2">
                <span className="truncate">{r.text}</span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {formatTime(r.fireAt)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Watchlist pendiente</CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-sm">
            {(Object.keys(counts) as WatchlistKind[])
              .filter((k) => counts[k] > 0)
              .map((k) => {
                const Icon = KIND_ICON[k];
                return (
                  <Badge key={k} variant="secondary" className="gap-1">
                    <Icon className="size-3" />
                    {KIND_LABEL[k]} · {counts[k]}
                  </Badge>
                );
              })}
            {pendingCount === 0 && <span className="text-muted-foreground">Lista vacía.</span>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gastos por día</CardTitle>
          <CardDescription>Soles (PEN) · mes actual</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyBarChart data={dailyTotals} />
        </CardContent>
      </Card>
    </>
  );
}
