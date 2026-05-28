/**
 * Rate limit por remitente en ventanas de 1 minuto, persistido en KV.
 * Limite por defecto: 30 mensajes/minuto (spec §11.1).
 */

const LIMIT_PER_MINUTE = 30;

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
}

export async function checkRateLimit(
  kv: KVNamespace,
  phone: string,
  now: Date = new Date(),
): Promise<RateLimitResult> {
  const minute = Math.floor(now.getTime() / 60_000);
  const key = `rl:${phone}:${minute}`;
  const raw = await kv.get(key);
  const count = raw ? Number(raw) : 0;
  if (count >= LIMIT_PER_MINUTE) {
    return { allowed: false, count, limit: LIMIT_PER_MINUTE };
  }
  // TTL 90s — la ventana ya cubierta + 30s de gracia para gets concurrentes.
  await kv.put(key, String(count + 1), { expirationTtl: 90 });
  return { allowed: true, count: count + 1, limit: LIMIT_PER_MINUTE };
}
