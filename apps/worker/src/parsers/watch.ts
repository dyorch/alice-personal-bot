import type { WatchlistKind } from '@alice/shared';

export type WatchCommand =
  | { kind: 'create'; itemKind: WatchlistKind; title: string }
  | { kind: 'list' }
  | { kind: 'mark_watched'; id: number }
  | { kind: 'delete'; id: number };

/**
 * Parsea:
 *   /ver                 -> lista
 *   /ver lista           -> lista
 *   /ver visto <id>      -> marca como visto
 *   /ver borrar <id>     -> borra
 *   /ver <kind> <title>  -> crea (kind acepta varios alias en espanol)
 */
export function parseWatchCommand(text: string): WatchCommand | null {
  const m = text.trim().match(/^\/ver\s*(.*)$/i);
  if (!m) return null;
  const rest = m[1]!.trim();
  if (!rest || /^lista$/i.test(rest)) return { kind: 'list' };

  const visto = rest.match(/^visto\s+(\d+)$/i);
  if (visto) return { kind: 'mark_watched', id: Number(visto[1]) };

  const del = rest.match(/^borrar\s+(\d+)$/i);
  if (del) return { kind: 'delete', id: Number(del[1]) };

  const create = rest.match(/^(\S+)\s+(.+)$/);
  if (create) {
    const itemKind = normalizeKind(create[1]!);
    if (!itemKind) return null;
    return { kind: 'create', itemKind, title: create[2]!.trim() };
  }
  return null;
}

const KIND_ALIASES: Record<string, WatchlistKind> = {
  peli: 'movie',
  pelicula: 'movie',
  película: 'movie',
  movie: 'movie',
  film: 'movie',
  serie: 'series',
  series: 'series',
  tt: 'tiktok',
  tiktok: 'tiktok',
  yt: 'video',
  video: 'video',
  otro: 'other',
  other: 'other',
  enlace: 'other',
  link: 'other',
};

function normalizeKind(raw: string): WatchlistKind | null {
  return KIND_ALIASES[raw.toLowerCase()] ?? null;
}

export function isUrl(text: string): boolean {
  return /^https?:\/\/\S+$/i.test(text.trim());
}
