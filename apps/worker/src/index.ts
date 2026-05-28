import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { createRepos } from './db/index.js';
import type { Env } from './env.js';
import { AppError } from './errors.js';
import { fail, ok } from './utils/response.js';
import {
  handleWebhookHandshake,
  handleWebhookPost,
  type ProcessAllowedMessage,
} from './webhook/handler.js';

const app = new Hono<{ Bindings: Env }>();

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json(
      fail(err.code, err.message, err.details),
      err.status as 400 | 401 | 404 | 429 | 500 | 502,
    );
  }
  console.error('[unhandled]', err);
  return c.json(fail('INTERNAL_ERROR', 'Error interno del servidor'), 500);
});

app.get('/api/health', (c) =>
  c.json(ok({ status: 'ok', now: new Date().toISOString() })),
);

// ---------------------------------------------------------------------------
// Webhook WhatsApp
// ---------------------------------------------------------------------------

/**
 * Procesador stub: por ahora solo deja huella en `message_log` con
 * `status='allowed'`. La tarea 11 (router) lo reemplaza por la pieza que
 * clasifica intent, ejecuta el modulo y envia la respuesta.
 */
const stubProcessMessage: ProcessAllowedMessage = async (_env, repos, msg) => {
  await repos.messages.log({
    direction: 'in',
    senderPhone: msg.from,
    senderName: msg.senderName,
    waMessageId: msg.waId,
    body: msg.body,
    messageType: msg.messageType,
    intent: 'unknown',
    status: 'allowed',
    rejectionReason: null,
    rawPayload: msg.rawPayload.slice(0, 4000),
  });
};

app.get('/webhook', (c) => {
  const url = new URL(c.req.url);
  return handleWebhookHandshake(url, c.env.WHATSAPP_VERIFY_TOKEN);
});

app.post('/webhook', async (c) => {
  const rawBody = await c.req.raw.clone().text();
  const sig = c.req.header('x-hub-signature-256') ?? null;
  const repos = createRepos(c.env.DB);
  return handleWebhookPost(c.env, repos, rawBody, sig, stubProcessMessage);
});

// API routes — tarea 13
// app.route('/api/expenses', expenseRoutes);

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, _env: Env, _ctx: ExecutionContext) {
    // Cron — tarea 12 (recordatorios + purga de message_log).
  },
} satisfies ExportedHandler<Env>;
