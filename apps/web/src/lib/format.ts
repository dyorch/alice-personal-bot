import type { Currency } from './types';

const TZ = 'America/Lima';

const CURRENCY_SYMBOL: Record<Currency, string> = {
  PEN: 'S/',
  USD: '$',
};

/** Formatea un monto con su simbolo de moneda. Ej: `S/ 230.00`, `$ 30.00`. */
export function formatMoney(amount: number, currency: Currency): string {
  const value = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${CURRENCY_SYMBOL[currency]} ${value}`;
}

/** Fecha corta en espanol. Acepta `YYYY-MM-DD` o ISO. Ej: `27 may 2026`. */
export function formatDate(value: string): string {
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: TZ,
  }).format(date);
}

/** Fecha + hora local de Lima. Ej: `27 may 2026, 14:30`. */
export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TZ,
  }).format(new Date(value));
}

/** Solo la hora local de Lima. Ej: `09:00`. */
export function formatTime(value: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TZ,
  }).format(new Date(value));
}

/** Distancia relativa amable respecto a "ahora". Ej: `en 3 dias`, `hace 2 h`. */
export function formatRelative(value: string, now: Date = new Date()): string {
  const target = new Date(value);
  const diffMs = target.getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const minutes = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / 3_600_000);
  const days = Math.round(diffMs / 86_400_000);

  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  return rtf.format(days, 'day');
}
