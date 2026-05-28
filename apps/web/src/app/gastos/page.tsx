import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpensesTable } from '@/components/expenses-table';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { MonthlyBarChart } from '@/components/charts/monthly-bar-chart';
import { formatMoney } from '@/lib/format';
import {
  categoryTotals,
  dailyTotalsCurrentMonth,
  listAllExpenses,
  monthSummary,
  nowIso,
} from '@/lib/data';

export default async function GastosPage() {
  const [{ totalsByCurrency }, expenses, daily, byCategoryPen] = await Promise.all([
    monthSummary(),
    listAllExpenses(),
    dailyTotalsCurrentMonth(),
    categoryTotals('PEN'),
  ]);
  const pen = totalsByCurrency.find((t) => t.currency === 'PEN');
  const usd = totalsByCurrency.find((t) => t.currency === 'USD');

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Tus gastos y resúmenes.</p>
        <Button render={<Link href="/gastos/nuevo" />}>
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
          <ExpensesTable expenses={expenses} nowIso={nowIso()} />
        </CardContent>
      </Card>
    </>
  );
}
