/**
 * Notificacion fire-and-forget cuando llega un mensaje sospechoso. Si
 * `SECURITY_ALERT_WEBHOOK` no esta configurado, no hace nada.
 */

export interface AlertInfo {
  reason: string;
  phone: string;
  name?: string | null;
  snippet?: string;
}

export async function sendSecurityAlert(
  webhookUrl: string | undefined,
  info: AlertInfo,
): Promise<void> {
  if (!webhookUrl) return;
  const text = [
    `🚨 *Alice* — ${info.reason}`,
    `De: +${info.phone || '?'}${info.name ? ` (${info.name})` : ''}`,
    info.snippet ? `Mensaje: ${truncate(info.snippet, 200)}` : null,
  ]
    .filter(Boolean)
    .join('\n');
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error('[security alert failed]', err);
  }
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}
