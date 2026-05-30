import { createRepos } from '../db/index.js';
import type { Env } from '../env.js';
import { sendAndLog } from '../whatsapp/send.js';

/**
 * Handler del cron (corre cada minuto). Hace dos cosas:
 *   1) Envia recordatorios cuyo `fire_at` ya paso y aun no fueron enviados.
 *   2) Una vez al dia a las 03:00 (hora local del usuario) purga `message_log`
 *      mas antiguo que `MESSAGE_LOG_RETENTION_DAYS` dias (spec §11.4).
 */
export async function runCron(env: Env, ctx: ExecutionContext): Promise<void> {
  const repos = createRepos(env.DB);
  const now = new Date();
  const nowIso = now.toISOString();

  // 1) Recordatorios vencidos.
  //
  // Orden: claim (markSent atómico con `sent = 0`) ANTES de enviar. Si dos
  // crons se solapan, solo uno obtiene `true` y envía. Si el envío falla
  // después del claim, perdemos ese recordatorio (queda en `sent=1`) pero
  // evitamos duplicados — preferimos at-most-once a at-least-once para
  // notificaciones por WhatsApp.
  const due = await repos.reminders.duePending(nowIso, 50);
  for (const r of due) {
    ctx.waitUntil(
      (async () => {
        const claimed = await repos.reminders.markSent(r.id);
        if (!claimed) return;
        const res = await sendAndLog(env, repos, env.ALLOWED_PHONE, `🔔 ${r.text}`);
        if (!res.ok) {
          console.error(`[cron] envío fallido tras claim #${r.id}: ${res.error}`);
        }
      })(),
    );
  }

  // 2) Purga diaria a las 03:00 hora del usuario
  if (isPurgeWindow(now, env.USER_TZ)) {
    const retention = Number(env.MESSAGE_LOG_RETENTION_DAYS) || 180;
    ctx.waitUntil(
      (async () => {
        const purged = await repos.messages.purgeOlderThan(retention);
        if (purged > 0) console.log(`[cron] purgados ${purged} mensajes >${retention}d`);
      })(),
    );
  }
}

function isPurgeWindow(now: Date, tz: string): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const hour = parts.find((p) => p.type === 'hour')?.value;
  const minute = parts.find((p) => p.type === 'minute')?.value;
  return hour === '03' && minute === '00';
}
