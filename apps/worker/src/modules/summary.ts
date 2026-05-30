import type { Repos } from '../db/index.js';
import { KIND_LABEL } from '../copy.js';
import { formatMoney } from '../utils/format.js';

/**
 * Resumen rápido del mes para responder a `/resumen` desde WhatsApp.
 * Reutiliza el summary de gastos y los counts ya existentes en los repos.
 */
export async function handleSummary(repos: Repos, tz: string): Promise<string> {
  const [summary, pendingReminders, watchCounts] = await Promise.all([
    repos.expenses.summary('month', tz),
    repos.reminders.list({ status: 'pending', limit: 1000, offset: 0 }),
    repos.watchlist.countsByKind(),
  ]);

  const lines = [`📊 *Resumen* — ${summary.from.slice(0, 7)}`, ''];

  if (summary.totalsByCurrency.length === 0) {
    lines.push('Sin gastos este mes aún.');
  } else {
    for (const t of summary.totalsByCurrency) {
      const icon = t.currency === 'PEN' ? '💰' : '💵';
      lines.push(`${icon} ${formatMoney(t.total, t.currency)} · ${t.count} ${t.count === 1 ? 'gasto' : 'gastos'}`);
    }

    const topPen = summary.byCategory
      .filter((c) => c.currency === 'PEN')
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
    if (topPen.length > 0) {
      lines.push('');
      const medals = ['🥇', '🥈', '🥉'];
      topPen.forEach((c, i) => {
        lines.push(`${medals[i]} ${c.category} · ${formatMoney(c.total, 'PEN')}`);
      });
    }
  }

  lines.push('');
  lines.push(`🔔 ${pendingReminders.length} recordatorio${pendingReminders.length === 1 ? '' : 's'} pendiente${pendingReminders.length === 1 ? '' : 's'}`);

  const watchTotal = Object.values(watchCounts).reduce((s, n) => s + n, 0);
  if (watchTotal > 0) {
    const summary = Object.entries(watchCounts)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${KIND_LABEL[k] ?? k} ${n}`)
      .join(' · ');
    lines.push(`📺 ${watchTotal} pendiente${watchTotal === 1 ? '' : 's'} en watchlist (${summary})`);
  } else {
    lines.push('📺 Watchlist al día');
  }

  return lines.join('\n');
}
