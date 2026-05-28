import type { Repos } from '../db/index.js';
import { COPY, KIND_LABEL } from '../copy.js';
import type { Intent } from '../router.js';

type CreateIntent = Extract<Intent, { kind: 'watch_create' }>;
type MarkIntent = Extract<Intent, { kind: 'watch_mark' }>;
type DeleteIntent = Extract<Intent, { kind: 'watch_delete' }>;

export async function handleWatchCreate(
  intent: CreateIntent,
  repos: Repos,
): Promise<string> {
  const item = await repos.watchlist.create({
    kind: intent.itemKind,
    title: intent.title ?? undefined,
    url: intent.url ?? undefined,
  });
  return [
    '➕ Anotado en la watchlist',
    `${KIND_LABEL[item.kind] ?? item.kind} · ${item.title ?? item.url ?? ''}`,
    `ID #${item.id}`,
  ].join('\n');
}

export async function handleWatchList(repos: Repos): Promise<string> {
  const pending = await repos.watchlist.list({ status: 'pending', limit: 50, offset: 0 });
  if (pending.length === 0) return '📺 No tienes pendientes en la watchlist.';
  const counts = await repos.watchlist.countsByKind();
  const summary = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${KIND_LABEL[k] ?? k}: ${n}`)
    .join(' · ');
  const lines = ['📺 *Watchlist pendiente*', summary, ''];
  for (const w of pending.slice(0, 15)) {
    const label = w.title ?? w.url ?? '(sin titulo)';
    lines.push(`#${w.id} — ${KIND_LABEL[w.kind] ?? w.kind} · ${label}`);
  }
  if (pending.length > 15) lines.push(`… y ${pending.length - 15} mas.`);
  return lines.join('\n');
}

export async function handleWatchMark(intent: MarkIntent, repos: Repos): Promise<string> {
  const updated = await repos.watchlist.update(intent.id, { watched: true });
  return updated ? COPY.watchMarked(intent.id) : COPY.watchNotFound(intent.id);
}

export async function handleWatchDelete(intent: DeleteIntent, repos: Repos): Promise<string> {
  const ok = await repos.watchlist.remove(intent.id);
  return ok ? COPY.watchDeleted(intent.id) : COPY.watchNotFound(intent.id);
}
