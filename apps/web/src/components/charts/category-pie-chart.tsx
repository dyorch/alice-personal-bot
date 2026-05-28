'use client';

import { Cell, Pie, PieChart } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { CategoryTotal } from '@/lib/data';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function CategoryPieChart({ data }: { data: CategoryTotal[] }) {
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.category, { label: d.category, color: COLORS[i % COLORS.length] }]),
  );

  return (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-[280px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
        <Pie data={data} dataKey="total" nameKey="category" innerRadius={55} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={d.category} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="category" />} />
      </PieChart>
    </ChartContainer>
  );
}
