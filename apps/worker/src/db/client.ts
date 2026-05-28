import { CamelCasePlugin, Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';

import type { Database } from './schema.js';

/** Crea un cliente Kysely sobre el D1 binding del Worker. */
export function createDb(d1: D1Database): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new D1Dialect({ database: d1 }),
    plugins: [new CamelCasePlugin()],
  });
}

export type Db = Kysely<Database>;

/** Marca de tiempo ISO UTC con milisegundos (igual al default de SQL). */
export function nowIso(): string {
  return new Date().toISOString();
}
