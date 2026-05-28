'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { DailyTotal } from '@/lib/data';

const config = {
  total: { label: 'Gasto (S/)', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export function MonthlyBarChart({ data }: { data: DailyTotal[] }) {
  return (
    <ChartContainer config={config} className="h-[260px] w-full">
      <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} interval={2} />
        <ChartTooltip
          content={<ChartTooltipContent labelFormatter={(value) => `Día ${value}`} />}
        />
        <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  );
}
