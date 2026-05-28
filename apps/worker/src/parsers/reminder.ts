export type ReminderCommand =
  | { kind: 'create'; fireAtLocal: string; text: string }
  | { kind: 'list' }
  | { kind: 'delete'; id: number };

/**
 * Parsea:
 *   /recordar YYYY-MM-DD HH:mm <texto>
 *   /recordar borrar <id>
 *   /recordatorios (lista)
 */
export function parseReminderCommand(text: string): ReminderCommand | null {
  text = text.trim();

  if (/^\/recordatorios\s*$/i.test(text)) return { kind: 'list' };

  const m = text.match(/^\/recordar\s+(.+)$/i);
  if (!m) return null;
  const rest = m[1]!.trim();

  const del = rest.match(/^borrar\s+(\d+)$/i);
  if (del) return { kind: 'delete', id: Number(del[1]) };

  const create = rest.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s+(.+)$/);
  if (create) {
    const [, date, time, body] = create;
    const [h, mm] = time!.split(':');
    const hh = h!.padStart(2, '0');
    return { kind: 'create', fireAtLocal: `${date} ${hh}:${mm}`, text: body!.trim() };
  }

  return null;
}
