import {
  CreateReminderInput,
  ReminderQuery,
  UpdateReminderInput,
} from '@alice/shared';
import { Hono } from 'hono';

import { createRepos } from '../db/index.js';
import type { Env } from '../env.js';
import { NotFoundError, ValidationError } from '../errors.js';
import { ok } from '../utils/response.js';
import { bearerAuth } from './auth.js';
import { parseId, parseQuery } from './_util.js';

const router = new Hono<{ Bindings: Env }>();
router.use('*', bearerAuth);

router.get('/', async (c) => {
  const params = parseQuery(c.req.url, ReminderQuery);
  const { reminders } = createRepos(c.env.DB);
  return c.json(ok(await reminders.list(params)));
});

router.get('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  const { reminders } = createRepos(c.env.DB);
  const item = await reminders.get(id);
  if (!item) throw new NotFoundError(`recordatorio #${id}`);
  return c.json(ok(item));
});

router.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateReminderInput.safeParse(body);
  if (!parsed.success) throw new ValidationError('Body invalido', parsed.error.flatten());
  const { reminders } = createRepos(c.env.DB);
  return c.json(ok(await reminders.create(parsed.data)), 201);
});

router.patch('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  const body = await c.req.json().catch(() => ({}));
  const parsed = UpdateReminderInput.safeParse(body);
  if (!parsed.success) throw new ValidationError('Body invalido', parsed.error.flatten());
  const { reminders } = createRepos(c.env.DB);
  const item = await reminders.update(id, parsed.data);
  if (!item) throw new NotFoundError(`recordatorio #${id}`);
  return c.json(ok(item));
});

router.delete('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  const { reminders } = createRepos(c.env.DB);
  const removed = await reminders.remove(id);
  if (!removed) throw new NotFoundError(`recordatorio #${id}`);
  return c.json(ok({ id, deleted: true }));
});

export default router;
