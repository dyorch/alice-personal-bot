import type { ZodTypeAny, z } from 'zod';

import { ValidationError } from '../errors.js';

/** Parsea el `:id` de una ruta y valida que sea entero positivo. */
export function parseId(raw: string | undefined): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    throw new ValidationError(`id invalido: ${raw}`);
  }
  return id;
}

/** Parsea los query params de una URL contra un schema Zod. */
export function parseQuery<T extends ZodTypeAny>(url: string, schema: T): z.infer<T> {
  const params = Object.fromEntries(new URL(url).searchParams);
  const result = schema.safeParse(params);
  if (!result.success) throw new ValidationError('Query invalida', result.error.flatten());
  return result.data;
}
