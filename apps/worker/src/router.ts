import type { AiClassification, Currency, WatchlistKind } from '@alice/shared';

import { classifyWithAi } from './ai/classify.js';
import type { Env } from './env.js';
import { parseExpenseCommand, parseExpensesQuery } from './parsers/expense.js';
import { parseReminderCommand } from './parsers/reminder.js';
import { isUrl, parseWatchCommand } from './parsers/watch.js';

export type Intent =
  | {
      kind: 'expense_create';
      data: { amount: number; currency: Currency; category: string; description: string };
    }
  | { kind: 'expense_query'; period: 'day' | 'week' | 'month' }
  | { kind: 'expense_delete'; id: number }
  | { kind: 'reminder_create'; fireAtLocal: string; text: string }
  | { kind: 'reminder_list' }
  | { kind: 'reminder_delete'; id: number }
  | {
      kind: 'watch_create';
      itemKind: WatchlistKind;
      title: string | null;
      url: string | null;
    }
  | { kind: 'watch_list' }
  | { kind: 'watch_mark'; id: number }
  | { kind: 'watch_delete'; id: number }
  | { kind: 'help' }
  | { kind: 'unknown' };

/**
 * Decide la intencion de un mensaje libre. Orden (spec §3):
 *   1) Comando explicito (/gasto, /recordar, /ver, /ayuda)
 *   2) URL pelada → watchlist
 *   3) Fallback a Workers AI (clasifica → JSON validado por Zod)
 */
export async function route(text: string, env: Env): Promise<Intent> {
  const t = text.trim();
  if (!t) return { kind: 'unknown' };

  if (/^\/(ayuda|help)\b/i.test(t)) return { kind: 'help' };

  if (/^\/gasto\b/i.test(t) && !/^\/gastos/i.test(t)) {
    const parsed = parseExpenseCommand(t);
    return parsed
      ? { kind: 'expense_create', data: parsed }
      : { kind: 'unknown' };
  }

  if (/^\/gastos\b/i.test(t)) {
    const q = parseExpensesQuery(t);
    if (!q) return { kind: 'unknown' };
    if (q.kind === 'list') return { kind: 'expense_query', period: q.period };
    return { kind: 'expense_delete', id: q.id };
  }

  if (/^\/recordatorios?\b/i.test(t)) {
    const r = parseReminderCommand(t);
    if (!r) return { kind: 'unknown' };
    if (r.kind === 'create') {
      return { kind: 'reminder_create', fireAtLocal: r.fireAtLocal, text: r.text };
    }
    if (r.kind === 'list') return { kind: 'reminder_list' };
    return { kind: 'reminder_delete', id: r.id };
  }

  if (/^\/ver\b/i.test(t)) {
    const w = parseWatchCommand(t);
    if (!w) return { kind: 'unknown' };
    if (w.kind === 'create') {
      return { kind: 'watch_create', itemKind: w.itemKind, title: w.title, url: null };
    }
    if (w.kind === 'list') return { kind: 'watch_list' };
    if (w.kind === 'mark_watched') return { kind: 'watch_mark', id: w.id };
    return { kind: 'watch_delete', id: w.id };
  }

  if (isUrl(t)) {
    return { kind: 'watch_create', itemKind: 'other', title: null, url: t };
  }

  return aiToIntent(await classifyWithAi(t, env));
}

function aiToIntent(ai: AiClassification): Intent {
  switch (ai.intent) {
    case 'expense':
      return { kind: 'expense_create', data: ai.data };
    case 'reminder':
      return { kind: 'reminder_create', fireAtLocal: ai.data.fire_at, text: ai.data.text };
    case 'watch':
      return {
        kind: 'watch_create',
        itemKind: ai.data.kind,
        title: ai.data.title,
        url: ai.data.url,
      };
    default:
      return { kind: 'unknown' };
  }
}
