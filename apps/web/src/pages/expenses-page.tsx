import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExpensesTable } from '@/components/expenses-table';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { MonthlyBarChart } from '@/components/charts/monthly-bar-chart';
import { formatMoney } from '@/lib/format';
import { api, queryKeys } from '@/lib/api-client';
import {
  categoryTotalsFromSummary,
  dailyTotalsFromList,
} from '@/lib/derived';

export function ExpensesPage() {
  const summaryQuery = useQuery({
    queryKey: queryKeys.expenses.summary('month'),
    queryFn: () => api.expenses.summary('month'),
  });
  const expensesQuery = useQuery({
    queryKey: queryKeys.expenses.list({ limit: 500 }),
    queryFn: () => api.expenses.list({ limit: 500 }),
  });

  const summary = summaryQuery.data;
  const expenses = expensesQuery.data;

  const monthListQuery = useQuery({
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

  if (!summary || !expenses || !monthListQuery.data) {
    return <ExpensesSkeleton />;
  }

  const pen = summary.totalsByCurrency.find((t) => t.currency === 'PEN');
  const usd = summary.totalsByCurrency.find((t) => t.currency === 'USD');
  const byCategoryPen = categoryTotalsFromSummary(summary, 'PEN');
  const daysInMonth = Number(summary.to.slice(8, 10));
  const daily = dailyTotalsFromList(monthListQuery.data, daysInMonth);

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Tus gastos y resúmenes.</p>
        <Button render={<Link to="/expenses/new" />}>
          <Plus /> Nuevo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total en soles · este mes</CardDescription>
            <CardTitle className="text-2xl">{formatMoney(pen?.total ?? 0, 'PEN')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {pen?.count ?? 0} gastos
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total en dólares · este mes</CardDescription>
            <CardTitle className="text-2xl">{formatMoney(usd?.total ?? 0, 'USD')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {usd?.count ?? 0} gastos · nunca se mezclan monedas
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Por categoría (S/)</CardTitle>
          </CardHeader>
          <CardContent>
            {byCategoryPen.length > 0 ? (
              <CategoryPieChart data={byCategoryPen} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin gastos aún.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gastos por día</CardTitle>
          <CardDescription>Soles (PEN) · mes actual</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyBarChart data={daily} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todos los gastos</CardTitle>
          <CardDescription>Filtra, exporta o borra registros.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpensesTable expenses={expenses} nowIso={new Date().toISOString()} />
        </CardContent>
      </Card>
    </>
  );
}

function ExpensesSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-72" />
      <Skeleton className="h-96" />
    </>
  );
}
