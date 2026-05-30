/**
 * Helpers de zona horaria. Todo se guarda en UTC en D1; estas funciones
 * convierten entre la TZ local del usuario (config `USER_TZ`, por defecto
 * `America/Lima`) y UTC para ingesta / display.
 */

/** Offset (ms) entre `tz` y UTC para un instante dado. */
function tzOffsetMs(instant: Date, tz: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const lookup: Record<string, number> = {};
  for (const part of formatter.formatToParts(instant)) {
    if (part.type !== 'literal') lookup[part.type] = Number(part.value);
  }
  const hour = lookup.hour === 24 ? 0 : lookup.hour!;
  const tzMs = Date.UTC(
    lookup.year!,
    lookup.month! - 1,
    lookup.day!,
    hour,
    lookup.minute!,
    lookup.second!,
  );
  return tzMs - instant.getTime();
}

/**
 * Convierte una fecha+hora local (`YYYY-MM-DD HH:mm`) en `tz` a una instancia
 * UTC. Resuelve DST correctamente para zonas que la tienen.
 */
export function localDateTimeToUtc(local: string, tz: string): Date {
  const [datePart, timePart] = local.split(/[ T]/);
  if (!datePart || !timePart) {
    throw new Error(`Formato local invalido: "${local}"`);
  }
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  const naive = new Date(Date.UTC(y!, m! - 1, d!, hh!, mm!));
  const offset = tzOffsetMs(naive, tz);
  return new Date(naive.getTime() - offset);
}

/** Devuelve la fecha local `YYYY-MM-DD` que corresponde al instante en `tz`. */
export function localDate(instant: Date, tz: string): string {
  return instant.toLocaleDateString('en-CA', { timeZone: tz });
}

/** Hoy (`YYYY-MM-DD`) en la zona horaria del usuario. */
export function todayInTz(tz: string): string {
  return localDate(new Date(), tz);
}

/**
 * Hora actual del usuario en formato `YYYY-MM-DD HH:mm` (sin offset).
 * Útil para pasarle al modelo de IA un "ahora" que ya está en su TZ y
 * no tenga que convertir nada.
 */
export function nowInTz(tz: string, instant: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts: Record<string, string> = {};
  for (const part of fmt.formatToParts(instant)) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }
  const hour = parts.hour === '24' ? '00' : parts.hour!;
  return `${parts.year}-${parts.month}-${parts.day} ${hour}:${parts.minute}`;
}

/** Primer milisegundo del dia local en `tz`, expresado como Date UTC. */
export function startOfDayInTz(localYmd: string, tz: string): Date {
  return localDateTimeToUtc(`${localYmd} 00:00`, tz);
}

/** Ultimo milisegundo del dia local en `tz`, expresado como Date UTC. */
export function endOfDayInTz(localYmd: string, tz: string): Date {
  return new Date(localDateTimeToUtc(`${localYmd} 23:59`, tz).getTime() + 59_999);
}
