// URLs relativas: el bundle solo llama a `/api/*` del mismo origen.
// - En dev: vite proxy reenvía a localhost:8787 inyectando Bearer (vite.config.ts).
// - En prod: el worker que sirve esta SPA hace el proxy (apps/web/worker/index.ts)
//   añadiendo el Bearer del secret API_SHARED_TOKEN.
// El bundle JS nunca contiene tokens.

interface ApiOk<T> {
  ok: true;
  data: T;
  error: null;
}
interface ApiErr {
  ok: false;
  data: null;
  error: { code: string; message: string; details?: unknown };
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const body = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null;
  if (!body) {
    throw new ApiError('non_json', `Respuesta no JSON (HTTP ${res.status})`, res.status);
  }
  if (!body.ok) {
    throw new ApiError(body.error.code, body.error.message, res.status, body.error.details);
  }
  return body.data;
}

export function qs(params: Record<string, unknown>): string {
  const pairs: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return pairs.length === 0 ? '' : `?${pairs.join('&')}`;
}
