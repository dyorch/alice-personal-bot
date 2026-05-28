import {
  CreateWatchlistInput,
  UpdateWatchlistInput,
  WatchlistQuery,
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
  const params = parseQuery(c.req.url, WatchlistQuery);
  const { watchlist } = createRepos(c.env.DB);
  return c.json(ok(await watchlist.list(params)));
});

router.get('/counts', async (c) => {
  const { watchlist } = createRepos(c.env.DB);
  return c.json(ok(await watchlist.countsByKind()));
});

router.get('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  const { watchlist } = createRepos(c.env.DB);
  const item = await watchlist.get(id);
  if (!item) throw new NotFoundError(`entrada #${id}`);
  return c.json(ok(item));
});

router.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateWatchlistInput.safeParse(body);
  if (!parsed.success) throw new ValidationError('Body invalido', parsed.error.flatten());
  const { watchlist } = createRepos(c.env.DB);
  return c.json(ok(await watchlist.create(parsed.data)), 201);
});

router.patch('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  const body = await c.req.json().catch(() => ({}));
  const parsed = UpdateWatchlistInput.safeParse(body);
  if (!parsed.success) throw new ValidationError('Body invalido', parsed.error.flatten());
  const { watchlist } = createRepos(c.env.DB);
  const item = await watchlist.update(id, parsed.data);
  if (!item) throw new NotFoundError(`entrada #${id}`);
  return c.json(ok(item));
});

router.delete('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  const { watchlist } = createRepos(c.env.DB);
  const removed = await watchlist.remove(id);
  if (!removed) throw new NotFoundError(`entrada #${id}`);
  return c.json(ok({ id, deleted: true }));
});

export default router;
