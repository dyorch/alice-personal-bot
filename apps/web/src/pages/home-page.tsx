import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, ShieldAlert } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MonthlyBarChart } from '@/components/charts/monthly-bar-chart';
import { formatMoney, formatTime } from '@/lib/format';
import { KIND_ICON, KIND_LABEL } from '@/lib/watchlist-ui';
import { api, queryKeys } from '@/lib/api-client';
import {
  dailyTotalsFromList,
  deriveMonthSummary,
  previousMonthKey,
  topCategoriesFromSummary,
  upcomingReminders,
} from '@/lib/derived';
import type { WatchlistKind } from '@/lib/types';

export function HomePage() {
  const summaryQuery = useQuery({
    queryKey: queryKeys.expenses.summary('month'),
    queryFn: () => api.expenses.summary('month'),
  });
  const summary = summaryQuery.data;

  const prevMonthKey = summary ? previousMonthKey(summary.from.slice(0, 7)) : null;
  const prevListQuery = useQuery({
    queryKey: queryKeys.expenses.list({
      from: prevMonthKey ? `${prevMonthKey}-01` : '',
      to: prevMonthKey ? `${prevMonthKey}-31` : '',
      limit: 500,
    }),
    queryFn: () =>
      api.expenses.list({
        from: `${prevMonthKey}-01`,
        to: `${prevMonthKey}-31`,
        limit: 500,
      }),
    enabled: prevMonthKey !== null,
  });

  const currentListQuery = useQuery({
    queryKey: queryKeys.expenses.list({
      from: summary?.from ?? '',
      to: summary?.to ?? '',
      currency: 'PEN',
      limit: 500,
    }),
    queryFn: () =>
      api.expenses.list({
        from: summary!.from,
        to: summary!.to,
        currency: 'PEN',
        limit: 500,
      }),
    enabled: summary !== undefined,
  });

  const pendingRemindersQuery = useQuery({
    queryKey: queryKeys.reminders.list({ status: 'pending', limit: 500 }),
    queryFn: () => api.reminders.list({ status: 'pending', limit: 500 }),
  });

  const watchlistCountsQuery = useQuery({
    queryKey: queryKeys.watchlist.counts(),
    queryFn: () => api.watchlist.counts(),
  });
  const watchlistPendingQuery = useQuery({
    queryKey: queryKeys.watchlist.list({ status: 'pending', limit: 500 }),
    queryFn: () => api.watchlist.list({ status: 'pending', limit: 500 }),
  });

  const statsQuery = useQuery({
    queryKey: queryKeys.messages.stats(),
    queryFn: () => api.messages.stats(),
  });

  if (!summary || !prevListQuery.data || !currentListQuery.data) {
    return <HomeSkeleton />;
  }

  const month = deriveMonthSummary(summary, prevListQuery.data);
  const top = topCategoriesFromSummary(summary, 3, 'PEN');
  const daysInMonth = Number(summary.to.slice(8, 10));
  const dailyTotals = dailyTotalsFromList(currentListQuery.data, daysInMonth);
  const upcoming = upcomingReminders(pendingRemindersQuery.data ?? [], 7);
  const counts = watchlistCountsQuery.data;
  const pendingCount = watchlistPendingQuery.data?.length ?? 0;
  const stats = statsQuery.data;

  const usd = month.totalsByCurrency.find((t) => t.currency === 'USD');
  const deltaUp = month.penDeltaPct >= 0;

  return (
    <>
      {stats && stats.rejectionsLast24h > 0 && (
        <Link
          to="/activity"
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
            <CardTitle className="text-2xl">{formatMoney(month.penNow, 'PEN')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <span
              className={`inline-flex items-center gap-1 ${deltaUp ? 'text-destructive' : 'text-emerald-500'}`}
            >
              {deltaUp ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
              {Math.abs(month.penDeltaPct).toFixed(1)}% vs mes anterior
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
            {counts &&
              (Object.keys(counts) as WatchlistKind[])
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

function HomeSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </>
  );
}
