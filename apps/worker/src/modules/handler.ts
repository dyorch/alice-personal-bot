import type { MessageIntent } from '@alice/shared';

import { COPY } from '../copy.js';
import type { Repos } from '../db/index.js';
import type { Env } from '../env.js';
import { route, type Intent } from '../router.js';
import type { IncomingMessage } from '../webhook/handler.js';
import { sendAndLog } from '../whatsapp/send.js';
import {
  handleExpenseCreate,
  handleExpenseDelete,
  handleExpenseQuery,
} from './expense.js';
import {
  handleReminderCreate,
  handleReminderDelete,
  handleReminderList,
} from './reminder.js';
import {
  handleWatchCreate,
  handleWatchDelete,
  handleWatchList,
  handleWatchMark,
} from './watchlist.js';

/**
 * Procesador real (reemplaza el stub en index.ts): clasifica el mensaje,
 * ejecuta el modulo, escribe el log del incoming con el intent resuelto y
 * envia la respuesta al usuario.
 */
export async function processAllowedMessage(
  env: Env,
  repos: Repos,
  msg: IncomingMessage,
): Promise<void> {
  if (msg.messageType !== 'text' || !msg.body.trim()) {
    await logIncoming(repos, msg, null);
    await sendAndLog(env, repos, msg.from, COPY.unsupportedType);
    return;
  }

  let intent: Intent;
  let reply: string;
  try {
    intent = await route(msg.body, env);
    reply = await executeIntent(intent, env, repos);
  } catch (err) {
    console.error('[handler] error ejecutando intent', err);
    intent = { kind: 'unknown' };
    reply = '⚠️ Algo fallo procesando tu mensaje. Vuelve a intentarlo en un momento.';
  }

  await logIncoming(repos, msg, intentToCategory(intent.kind));
  await sendAndLog(env, repos, msg.from, reply);
}

async function executeIntent(intent: Intent, env: Env, repos: Repos): Promise<string> {
  switch (intent.kind) {
    case 'expense_create':
      return handleExpenseCreate(intent, repos, env.USER_TZ);
    case 'expense_query':
      return handleExpenseQuery(intent, repos, env.USER_TZ);
    case 'expense_delete':
      return handleExpenseDelete(intent, repos);
    case 'reminder_create':
      return handleReminderCreate(intent, repos, env.USER_TZ);
    case 'reminder_list':
      return handleReminderList(repos, env.USER_TZ);
    case 'reminder_delete':
      return handleReminderDelete(intent, repos);
    case 'watch_create':
      return handleWatchCreate(intent, repos);
    case 'watch_list':
      return handleWatchList(repos);
    case 'watch_mark':
      return handleWatchMark(intent, repos);
    case 'watch_delete':
      return handleWatchDelete(intent, repos);
    case 'help':
      return COPY.help;
    case 'web':
      return COPY.web;
    case 'unknown':
      return COPY.unknown;
  }
}

function intentToCategory(kind: Intent['kind']): MessageIntent | null {
  if (kind.startsWith('expense')) return 'expense';
  if (kind.startsWith('reminder')) return 'reminder';
  if (kind.startsWith('watch')) return 'watch';
  if (kind === 'unknown') return 'unknown';
  return null;
}

async function logIncoming(
  repos: Repos,
  msg: IncomingMessage,
  intent: MessageIntent | null,
): Promise<void> {
  await repos.messages.log({
    direction: 'in',
    senderPhone: msg.from,
    senderName: msg.senderName,
    waMessageId: msg.waId,
    body: msg.body,
    messageType: msg.messageType,
    intent,
    status: 'allowed',
    rejectionReason: null,
    rawPayload: msg.rawPayload.slice(0, 4000),
  });
}
