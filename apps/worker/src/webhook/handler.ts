import { WhatsAppWebhookPayload, type WhatsAppMessage } from '@alice/shared';

import type { Repos } from '../db/index.js';
import type { Env } from '../env.js';
import { sendSecurityAlert } from '../security/alerts.js';
import { checkRateLimit } from '../security/ratelimit.js';
import { verifySignature } from '../security/signature.js';

/** Mensaje normalizado que despachamos al router (tarea 11). */
export interface IncomingMessage {
  /** E.164 sin '+'. */
  from: string;
  /** wamid de Meta — sirve para dedupe. */
  waId: string;
  /** Texto del mensaje (vacio si el tipo no es 'text'). */
  body: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'other';
  senderName: string | null;
  /** Payload completo crudo para guardar en message_log. */
  rawPayload: string;
  timestampMs: number;
}

export type ProcessAllowedMessage = (
  env: Env,
  repos: Repos,
  msg: IncomingMessage,
) => Promise<void>;

/** GET /webhook — handshake de Meta. */
export function handleWebhookHandshake(url: URL, verifyToken: string): Response {
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

/**
 * POST /webhook — verifica firma, deduplica, valida remitente y rate limit,
 * y delega al `processAllowedMessage` si todo pasa. Siempre responde 200 para
 * que Meta no reintente (los rechazos quedan en `message_log`).
 */
export async function handleWebhookPost(
  env: Env,
  repos: Repos,
  rawBody: string,
  signatureHeader: string | null,
  processAllowedMessage: ProcessAllowedMessage,
): Promise<Response> {
  // 1) Firma. Antes de tocar nada.
  const signed = await verifySignature(rawBody, signatureHeader, env.WHATSAPP_APP_SECRET);
  if (!signed) {
    await repos.messages.log({
      direction: 'in',
      senderPhone: '',
      senderName: null,
      waMessageId: null,
      body: '',
      messageType: 'other',
      intent: null,
      status: 'rejected_invalid_signature',
      rejectionReason: 'X-Hub-Signature-256 no coincide con WHATSAPP_APP_SECRET',
      rawPayload: truncate(rawBody, 4000),
    });
    return new Response('OK', { status: 200 });
  }

  // 2) Parsear payload.
  let payload;
  try {
    payload = WhatsAppWebhookPayload.parse(JSON.parse(rawBody));
  } catch (err) {
    console.error('[webhook] payload invalido', err);
    return new Response('OK', { status: 200 });
  }

  // 3) Procesar mensajes.
  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const value = change.value;
      const contactsByPhone = new Map<string, string>();
      for (const contact of value.contacts ?? []) {
        if (contact.wa_id && contact.profile?.name) {
          contactsByPhone.set(contact.wa_id, contact.profile.name);
        }
      }
      for (const message of value.messages ?? []) {
        await handleOneMessage(
          env,
          repos,
          message,
          contactsByPhone.get(message.from) ?? null,
          rawBody,
          processAllowedMessage,
        );
      }
    }
  }

  return new Response('OK', { status: 200 });
}

async function handleOneMessage(
  env: Env,
  repos: Repos,
  message: WhatsAppMessage,
  senderName: string | null,
  rawPayload: string,
  processAllowedMessage: ProcessAllowedMessage,
): Promise<void> {
  const waId = message.id;
  const phone = message.from;
  const messageType = normalizeType(message.type);
  const body = extractBody(message);
  const timestampMs = Number(message.timestamp) * 1000 || Date.now();

  // Dedupe (Meta reintenta hasta que respondamos 200).
  if (await repos.messages.existsByWaId(waId)) return;

  // Remitente no autorizado.
  if (phone !== env.ALLOWED_PHONE) {
    await repos.messages.log({
      direction: 'in',
      senderPhone: phone,
      senderName,
      waMessageId: waId,
      body,
      messageType,
      intent: null,
      status: 'rejected_unknown_sender',
      rejectionReason: 'remitente distinto de ALLOWED_PHONE',
      rawPayload: truncate(rawPayload, 4000),
    });
    await sendSecurityAlert(env.SECURITY_ALERT_WEBHOOK, {
      reason: 'mensaje desde numero desconocido',
      phone,
      name: senderName,
      snippet: body || `(tipo ${messageType})`,
    });
    return;
  }

  // Rate limit.
  const rl = await checkRateLimit(env.RATE_LIMIT, phone);
  if (!rl.allowed) {
    await repos.messages.log({
      direction: 'in',
      senderPhone: phone,
      senderName,
      waMessageId: waId,
      body,
      messageType,
      intent: null,
      status: 'rejected_rate_limit',
      rejectionReason: `excede ${rl.limit} msg/min`,
      rawPayload: truncate(rawPayload, 4000),
    });
    return;
  }

  // Mensaje permitido — el procesado real lo hace el caller (tarea 11). El
  // log final con `status='allowed'` e `intent` lo escribe ahi tambien.
  const incoming: IncomingMessage = {
    from: phone,
    waId,
    body,
    messageType,
    senderName,
    rawPayload,
    timestampMs,
  };
  try {
    await processAllowedMessage(env, repos, incoming);
  } catch (err) {
    console.error('[webhook] error procesando mensaje', err);
    await repos.messages.log({
      direction: 'in',
      senderPhone: phone,
      senderName,
      waMessageId: waId,
      body,
      messageType,
      intent: null,
      status: 'failed',
      rejectionReason: err instanceof Error ? err.message : String(err),
      rawPayload: truncate(rawPayload, 4000),
    });
  }
}

function extractBody(message: WhatsAppMessage): string {
  if (message.type !== 'text') return '';
  const text = (message as { text?: { body?: unknown } }).text;
  return typeof text?.body === 'string' ? text.body : '';
}

function normalizeType(type: string): IncomingMessage['messageType'] {
  switch (type) {
    case 'text':
    case 'image':
    case 'audio':
    case 'video':
    case 'document':
    case 'location':
      return type;
    default:
      return 'other';
  }
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}
