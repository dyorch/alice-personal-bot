import type { Repos } from '../db/index.js';
import { COPY } from '../copy.js';
import type { Intent } from '../router.js';
import { formatDateTimeShort } from '../utils/format.js';
import { localDateTimeToUtc } from '../utils/time.js';

type CreateIntent = Extract<Intent, { kind: 'reminder_create' }>;
type DeleteIntent = Extract<Intent, { kind: 'reminder_delete' }>;
type EditIntent = Extract<Intent, { kind: 'edit_reminder' }>;

export async function handleReminderCreate(
  intent: CreateIntent,
  repos: Repos,
  tz: string,
): Promise<string> {
  const fireAtUtc = localDateTimeToUtc(intent.fireAtLocal, tz);
  if (fireAtUtc.getTime() <= Date.now()) {
    return [
      '⚠️ Esa fecha ya pasó.',
      `Me diste ${formatDateTimeShort(fireAtUtc.toISOString(), tz)} (${tz}).`,
      'Usa una fecha futura.',
    ].join('\n');
  }
  const r = await repos.reminders.create({
    text: intent.text,
    fireAt: fireAtUtc.toISOString(),
  });
  return [
    '🔔 Recordatorio creado',
    `📝 ${r.text}`,
    `⏰ ${formatDateTimeShort(r.fireAt, tz)} (${tz})`,
    `ID #${r.id}`,
  ].join('\n');
}

export async function handleReminderList(repos: Repos, tz: string): Promise<string> {
  const pending = await repos.reminders.list({ status: 'pending', limit: 50, offset: 0 });
  if (pending.length === 0) return '🔔 No tienes recordatorios pendientes.';
  const lines = ['🔔 *Recordatorios pendientes:*', ''];
  for (const r of pending) {
    lines.push(`#${r.id} — ${formatDateTimeShort(r.fireAt, tz)} · ${r.text}`);
  }
  return lines.join('\n');
}

export async function handleReminderDelete(
  intent: DeleteIntent,
  repos: Repos,
): Promise<string> {
  const ok = await repos.reminders.remove(intent.id);
  return ok ? COPY.reminderDeleted(intent.id) : COPY.reminderNotFound(intent.id);
}

export async function handleReminderEdit(
  intent: EditIntent,
  repos: Repos,
  tz: string,
): Promise<string> {
  const patch: { text?: string; fireAt?: string } = {};
  if (intent.updates.text !== undefined) patch.text = intent.updates.text;
  if (intent.updates.fireAtLocal !== undefined) {
    const fireAtUtc = localDateTimeToUtc(intent.updates.fireAtLocal, tz);
    if (fireAtUtc.getTime() <= Date.now()) {
      return [
        '⚠️ Esa fecha ya pasó.',
        `Me diste ${formatDateTimeShort(fireAtUtc.toISOString(), tz)} (${tz}).`,
        'Usa una fecha futura.',
      ].join('\n');
    }
    patch.fireAt = fireAtUtc.toISOString();
  }
  const updated = await repos.reminders.update(intent.id, patch);
  if (!updated) return COPY.reminderNotFound(intent.id);
  return [
    '✏️ Recordatorio actualizado',
    `📝 ${updated.text}`,
    `⏰ ${formatDateTimeShort(updated.fireAt, tz)} (${tz})`,
    `ID #${updated.id}`,
  ].join('\n');
}
