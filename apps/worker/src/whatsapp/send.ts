import type { Repos } from '../db/index.js';
import type { Env } from '../env.js';

export interface SendResult {
  ok: boolean;
  waMessageId?: string | undefined;
  error?: string | undefined;
}

/** Envia un texto al numero `to` via WhatsApp Cloud API. */
export async function sendText(env: Env, to: string, body: string): Promise<SendResult> {
  const url = `https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_ID}/messages`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body, preview_url: false },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `${res.status}: ${text.slice(0, 300)}` };
    }
    const data = (await res.json()) as { messages?: Array<{ id?: string }> };
    return { ok: true, waMessageId: data.messages?.[0]?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Envia y registra el outgoing en `message_log`. Si el envio falla, queda con status='failed'. */
export async function sendAndLog(
  env: Env,
  repos: Repos,
  to: string,
  body: string,
): Promise<SendResult> {
  const result = await sendText(env, to, body);
  await repos.messages.log({
    direction: 'out',
    senderPhone: to,
    senderName: null,
    waMessageId: result.waMessageId ?? null,
    body,
    messageType: 'text',
    intent: null,
    status: result.ok ? 'sent' : 'failed',
    rejectionReason: result.error ?? null,
    rawPayload: '{}',
  });
  return result;
}
