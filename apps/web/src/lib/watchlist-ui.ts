import { Film, Link2, Music2, Tv, Video, type LucideIcon } from 'lucide-react';

import type { WatchlistKind } from './types';

export const KIND_LABEL: Record<WatchlistKind, string> = {
  movie: 'Película',
  series: 'Serie',
  tiktok: 'TikTok',
  video: 'Video',
  other: 'Enlace',
};

export const KIND_ICON: Record<WatchlistKind, LucideIcon> = {
  movie: Film,
  series: Tv,
  tiktok: Music2,
  video: Video,
  other: Link2,
};

/** Gradiente + color de ícono para la portada de cada tarjeta, por tipo. */
export const KIND_ACCENT: Record<WatchlistKind, string> = {
  movie: 'from-violet-500/25 to-violet-500/5 text-violet-400',
  series: 'from-sky-500/25 to-sky-500/5 text-sky-400',
  tiktok: 'from-pink-500/25 to-pink-500/5 text-pink-400',
  video: 'from-rose-500/25 to-rose-500/5 text-rose-400',
  other: 'from-emerald-500/25 to-emerald-500/5 text-emerald-400',
};
