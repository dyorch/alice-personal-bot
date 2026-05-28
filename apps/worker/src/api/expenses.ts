import {
  CreateExpenseInput,
  ExpenseQuery,
  ExpenseSummaryPeriod,
  UpdateExpenseInput,
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
  const params = parseQuery(c.req.url, ExpenseQuery);
  const { expenses } = createRepos(c.env.DB);
  return c.json(ok(await expenses.list(params)));
});

router.get('/summary', async (c) => {
  const period = ExpenseSummaryPeriod.safeParse(c.req.query('period') ?? 'month');
  if (!period.success) throw new ValidationError('period debe ser day|week|month');
  const { expenses } = createRepos(c.env.DB);
  return c.json(ok(await expenses.summary(period.data, c.env.USER_TZ)));
});

router.get('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  const { expenses } = createRepos(c.env.DB);
  const item = await expenses.get(id);
  if (!item) throw new NotFoundError(`gasto #${id}`);
  return c.json(ok(item));
});

router.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateExpenseInput.safeParse(body);
  if (!parsed.success) throw new ValidationError('Body invalido', parsed.error.flatten());
  const { expenses } = createRepos(c.env.DB);
  return c.json(ok(await expenses.create(parsed.data, c.env.USER_TZ)), 201);
});

router.patch('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  const body = await c.req.json().catch(() => ({}));
  const parsed = UpdateExpenseInput.safeParse(body);
  if (!parsed.success) throw new ValidationError('Body invalido', parsed.error.flatten());
  const { expenses } = createRepos(c.env.DB);
  const item = await expenses.update(id, parsed.data);
  if (!item) throw new NotFoundError(`gasto #${id}`);
  return c.json(ok(item));
});

router.delete('/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  const { expenses } = createRepos(c.env.DB);
  const removed = await expenses.remove(id);
  if (!removed) throw new NotFoundError(`gasto #${id}`);
  return c.json(ok({ id, deleted: true }));
});

export default router;
