import type { Currency, WatchlistKind } from '@alice/shared';

export type EditCommand =
  | { kind: 'edit_expense'; id: number; updates: ExpenseUpdates }
  | { kind: 'edit_reminder'; id: number; updates: ReminderUpdates }
  | { kind: 'edit_watchlist'; id: number; updates: WatchlistUpdates };

export interface ExpenseUpdates {
  amount?: number;
  currency?: Currency;
  category?: string;
  description?: string;
  /** YYYY-MM-DD en hora local del usuario. */
  spentAt?: string;
}

export interface ReminderUpdates {
  text?: string;
  /** Fecha + hora local "YYYY-MM-DD HH:mm". El handler convierte a UTC. */
  fireAtLocal?: string;
}

export interface WatchlistUpdates {
  title?: string;
  url?: string;
  notes?: string;
  kind?: WatchlistKind;
}

/**
 * Parsea variantes de `/editar <entidad> <id> <campo> <valor>`:
 *
 *   /editar gasto 142 monto 60
 *   /editar gasto 142 moneda USD
 *   /editar gasto 142 categoria comida
 *   /editar gasto 142 descripcion almuerzo con dani
 *   /editar gasto 142 fecha 2026-05-29
 *
 *   /editar recordatorio 25 texto pagar la luz
 *   /editar recordatorio 25 cuando 2026-05-30 09:00
 *
 *   /editar watchlist 7 titulo Dune Parte Dos
 *   /editar watchlist 7 url https://...
 *   /editar watchlist 7 notas recomendada por Dani
 *   /editar watchlist 7 tipo movie|series|tiktok|video|other
 *
 * Cada comando edita UN campo por llamada para mantener la sintaxis simple
 * en WhatsApp.
 */
export function parseEditCommand(text: string): EditCommand | null {
  const m = text.trim().match(/^\/editar\s+(gasto|recordatorio|watchlist)\s+(\d+)\s+(\w+)\s+(.+)$/i);
  if (!m) return null;
  const [, entity, idStr, fieldRaw, valueRaw] = m;
  const id = Number(idStr);
  if (!Number.isFinite(id) || id <= 0) return null;
  const field = fieldRaw!.toLowerCase();
  const value = valueRaw!.trim();

  switch (entity!.toLowerCase()) {
    case 'gasto': {
      const updates = mapExpenseField(field, value);
      return updates ? { kind: 'edit_expense', id, updates } : null;
    }
    case 'recordatorio': {
      const updates = mapReminderField(field, value);
      return updates ? { kind: 'edit_reminder', id, updates } : null;
    }
    case 'watchlist': {
      const updates = mapWatchlistField(field, value);
      return updates ? { kind: 'edit_watchlist', id, updates } : null;
    }
    default:
      return null;
  }
}

function mapExpenseField(field: string, value: string): ExpenseUpdates | null {
  switch (field) {
    case 'monto':
    case 'amount': {
      const n = Number(value);
      if (!Number.isFinite(n) || n <= 0) return null;
      return { amount: n };
    }
    case 'moneda':
    case 'currency': {
      const cur = value.toUpperCase();
      if (cur !== 'PEN' && cur !== 'USD') return null;
      return { currency: cur as Currency };
    }
    case 'categoria':
    case 'category':
      return { category: value.toLowerCase() };
    case 'descripcion':
    case 'description':
      return { description: value };
    case 'fecha':
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
      return { spentAt: value };
    default:
      return null;
  }
}

function mapReminderField(field: string, value: string): ReminderUpdates | null {
  switch (field) {
    case 'texto':
    case 'text':
      return { text: value };
    case 'cuando':
    case 'when': {
      const m = value.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})$/);
      if (!m) return null;
      const [, date, time] = m;
      const [h, mm] = time!.split(':');
      const hh = h!.padStart(2, '0');
      return { fireAtLocal: `${date} ${hh}:${mm}` };
    }
    default:
      return null;
  }
}

function mapWatchlistField(field: string, value: string): WatchlistUpdates | null {
  switch (field) {
    case 'titulo':
    case 'title':
      return { title: value };
    case 'url':
    case 'enlace':
      return { url: value };
    case 'notas':
    case 'notes':
      return { notes: value };
    case 'tipo':
    case 'kind': {
      const k = value.toLowerCase();
      if (!['movie', 'series', 'tiktok', 'video', 'other'].includes(k)) return null;
      return { kind: k as WatchlistKind };
    }
    default:
      return null;
  }
}
