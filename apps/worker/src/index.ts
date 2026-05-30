import { Hono } from 'hono';
import { cors } from 'hono/cors';

import expensesApi from './api/expenses.js';
import messageLogApi from './api/message-log.js';
import remindersApi from './api/reminders.js';
import watchlistApi from './api/watchlist.js';
import { runCron } from './cron/index.js';
import { createRepos } from './db/index.js';
import type { Env } from './env.js';
import { validateEnv } from './env.js';
import { AppError } from './errors.js';
import { processAllowedMessage } from './modules/handler.js';
import { fail, ok } from './utils/response.js';
import { handleWebhookHandshake, handleWebhookPost } from './webhook/handler.js';

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

// Webhook WhatsApp ---------------------------------------------------------

app.get('/webhook', (c) => {
  const url = new URL(c.req.url);
  return handleWebhookHandshake(url, c.env.WHATSAPP_VERIFY_TOKEN);
});

app.post('/webhook', async (c) => {
  try {
    validateEnv(c.env);
  } catch (err) {
    console.error('[env] configuración inválida en /webhook', err);
    return c.json(fail('config_error', 'Worker mal configurado'), 500);
  }
  const rawBody = await c.req.raw.clone().text();
  const sig = c.req.header('x-hub-signature-256') ?? null;
  const repos = createRepos(c.env.DB);
  return handleWebhookPost(c.env, repos, rawBody, sig, processAllowedMessage);
});

// API REST (auth Bearer via API_SHARED_TOKEN aplicado en cada sub-router)
app.route('/api/expenses', expensesApi);
app.route('/api/reminders', remindersApi);
app.route('/api/watchlist', watchlistApi);
app.route('/api/message-log', messageLogApi);

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    try {
      validateEnv(env);
    } catch (err) {
      console.error('[env] configuración inválida en scheduled cron', err);
      return;
    }
    await runCron(env, ctx);
  },
} satisfies ExportedHandler<Env>;
