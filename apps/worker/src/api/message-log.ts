import { MessageLogQuery } from '@alice/shared';
import { Hono } from 'hono';

import { createRepos } from '../db/index.js';
import type { Env } from '../env.js';
import { NotFoundError } from '../errors.js';
import { ok } from '../utils/response.js';
import { bearerAuth } from './auth.js';
import { parseId, parseQuery } from './_util.js';

const router = new Hono<{ Bindings: Env }>();
router.use('*', bearerAuth);

router.get('/', async (c) => {
  const params = parseQuery(c.req.url, MessageLogQuery);
  const { messages } = createRepos(c.env.DB);
  return c.json(ok(await messages.list(params)));
});

router.get('/stats', async (c) => {
  const { messages } = createRepos(c.env.DB);
  return c.json(ok(await messages.stats(c.env.USER_TZ)));
});

router.get('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  const { messages } = createRepos(c.env.DB);
  const item = await messages.get(id);
  if (!item) throw new NotFoundError(`mensaje #${id}`);
  return c.json(ok(item));
});

export default router;
