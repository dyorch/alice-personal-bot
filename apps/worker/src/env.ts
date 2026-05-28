import { z } from 'zod';

/**
 * Bindings y variables que recibe el Worker. Los bindings (DB, AI, KV) vienen
 * de wrangler.toml; los secretos via `wrangler secret put` o `.dev.vars`.
 */
export interface Env {
  // Bindings
  DB: D1Database;
  AI: Ai;
  RATE_LIMIT: KVNamespace;

  // Secrets
  WHATSAPP_TOKEN: string;
  WHATSAPP_PHONE_ID: string;
  WHATSAPP_VERIFY_TOKEN: string;
  WHATSAPP_APP_SECRET: string;
  ALLOWED_PHONE: string;
  API_SHARED_TOKEN: string;
  SECURITY_ALERT_WEBHOOK?: string;

  // Vars (wrangler.toml [vars])
  USER_TZ: string;
  DEFAULT_CURRENCY: string;
  MESSAGE_LOG_RETENTION_DAYS: string;
}

/**
 * Schema para validar al arranque. Si falta un secret critico el worker debe
 * negarse a procesar requests (spec §12.5).
 */
export const EnvSchema = z.object({
  WHATSAPP_TOKEN: z.string().min(1, 'WHATSAPP_TOKEN requerido'),
  WHATSAPP_PHONE_ID: z.string().min(1, 'WHATSAPP_PHONE_ID requerido'),
  WHATSAPP_VERIFY_TOKEN: z.string().min(8, 'WHATSAPP_VERIFY_TOKEN debe tener >= 8 chars'),
  WHATSAPP_APP_SECRET: z.string().min(8, 'WHATSAPP_APP_SECRET requerido'),
  ALLOWED_PHONE: z.string().regex(/^\d{8,15}$/, 'ALLOWED_PHONE debe estar en E.164 sin "+"'),
  API_SHARED_TOKEN: z.string().min(16, 'API_SHARED_TOKEN debe tener >= 16 chars'),
  SECURITY_ALERT_WEBHOOK: z
    .union([z.string().url(), z.literal('')])
    .optional()
    .default(''),
  USER_TZ: z.string().default('America/Lima'),
  DEFAULT_CURRENCY: z.enum(['PEN', 'USD']).default('PEN'),
  MESSAGE_LOG_RETENTION_DAYS: z.coerce.number().int().positive().default(180),
});

export type ValidatedEnv = z.infer<typeof EnvSchema>;

/** Lanza si la configuracion es invalida; usar en cada handler critico. */
export function validateEnv(env: Env): ValidatedEnv {
  return EnvSchema.parse(env);
}
