import type { DateRange } from 'react-day-picker';

/** Convierte ISO → Date local en zona horaria de Lima. */
export function limaDate(iso: string): Date {
  const [y, m, d] = new Date(iso)
    .toLocaleDateString('en-CA', { timeZone: 'America/Lima' })
    .split('-')
    .map(Number);
  return new Date(y!, m! - 1, d!);
}

/** Date → "YYYY-MM-DD" en TZ local. */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Mes anterior en formato "YYYY-MM". Ej: "2026-01" → "2025-12". */
export function previousMonthKey(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number);
  const d = new Date(Date.UTC(y!, m! - 1, 1));
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 7);
}

export type DatePreset = 'all' | 'today' | 'week' | 'month' | 'prevMonth' | 'custom';

export const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'all', label: 'Todas las fechas' },
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'prevMonth', label: 'Mes anterior' },
];

/** Calcula rango de fechas (YYYY-MM-DD) según preset. */
export function presetRange(
  preset: DatePreset,
  now: Date,
  custom: DateRange | undefined,
): { from: string | null; to: string | null } {
  switch (preset) {
    case 'today': {
      const k = dateKey(now);
      return { from: k, to: k };
    }
    case 'week': {
      const day = now.getDay() || 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { from: dateKey(monday), to: dateKey(sunday) };
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: dateKey(first), to: dateKey(last) };
    }
    case 'prevMonth': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: dateKey(first), to: dateKey(last) };
    }
    case 'custom':
      return {
        from: custom?.from ? dateKey(custom.from) : null,
        to: custom?.to ? dateKey(custom.to) : null,
      };
    default:
      return { from: null, to: null };
  }
}

/** Fecha corta en español. Ej: "27 may". */
export function shortDate(d: Date): string {
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}
