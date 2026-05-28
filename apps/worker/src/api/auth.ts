import { createMiddleware } from 'hono/factory';

import type { Env } from '../env.js';
import { UnauthorizedError } from '../errors.js';

/** Middleware Bearer para /api/*. La web envia `Authorization: Bearer <API_SHARED_TOKEN>`. */
export const bearerAuth = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const header = c.req.header('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Falta header Authorization: Bearer');
  }
  const token = header.slice('Bearer '.length).trim();
  if (token !== c.env.API_SHARED_TOKEN) {
    throw new UnauthorizedError('Token invalido');
  }
  await next();
});
