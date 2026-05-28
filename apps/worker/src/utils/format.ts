import type { Currency } from '@alice/shared';

const SYMBOL: Record<Currency, string> = { PEN: 'S/', USD: '$' };

/** Formatea un monto con su simbolo. Ej: `S/ 230.00`, `$ 30.00`. */
export function formatMoney(amount: number, currency: Currency): string {
  const value = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${SYMBOL[currency]} ${value}`;
}

/** Convierte fecha ISO UTC a `DD/MM HH:mm` en la TZ del usuario. */
export function formatDateTimeShort(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  }).format(new Date(iso));
}
