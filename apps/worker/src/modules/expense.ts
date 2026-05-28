import type { Repos } from '../db/index.js';
import { COPY } from '../copy.js';
import type { Intent } from '../router.js';
import { formatMoney } from '../utils/format.js';

type CreateIntent = Extract<Intent, { kind: 'expense_create' }>;
type QueryIntent = Extract<Intent, { kind: 'expense_query' }>;
type DeleteIntent = Extract<Intent, { kind: 'expense_delete' }>;

const PERIOD_LABEL: Record<QueryIntent['period'], string> = {
  day: 'Hoy',
  week: 'Esta semana',
  month: 'Este mes',
};

export async function handleExpenseCreate(
  intent: CreateIntent,
  repos: Repos,
  tz: string,
): Promise<string> {
  const e = await repos.expenses.create(intent.data, tz);
  return [
    '✅ Gasto registrado',
    `💰 ${formatMoney(e.amount, e.currency)} · ${e.category}`,
    e.description ? `📝 ${e.description}` : null,
    `📅 ${e.spentAt}`,
    `ID #${e.id}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export async function handleExpenseQuery(
  intent: QueryIntent,
  repos: Repos,
  tz: string,
): Promise<string> {
  const summary = await repos.expenses.summary(intent.period, tz);
  if (summary.totalsByCurrency.length === 0) {
    return `📊 ${PERIOD_LABEL[intent.period]}: sin gastos.`;
  }
  const totals = summary.totalsByCurrency
    .map((t) => `${formatMoney(t.total, t.currency)} (${t.count})`)
    .join(' · ');
  const lines = [`📊 ${PERIOD_LABEL[intent.period]} (${summary.from} → ${summary.to})`, totals];

  // Top 3 categorias en PEN (la moneda principal)
  const penCategories = summary.byCategory
    .filter((c) => c.currency === 'PEN')
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
  if (penCategories.length > 0) {
    lines.push('');
    lines.push('*Top categorias:*');
    for (const c of penCategories) {
      lines.push(`• ${c.category}: ${formatMoney(c.total, 'PEN')}`);
    }
  }
  return lines.join('\n');
}

export async function handleExpenseDelete(
  intent: DeleteIntent,
  repos: Repos,
): Promise<string> {
  const ok = await repos.expenses.remove(intent.id);
  return ok ? COPY.expenseDeleted(intent.id) : COPY.expenseNotFound(intent.id);
}
