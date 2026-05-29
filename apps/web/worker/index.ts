/**
 * Worker que sirve el SPA de Alice y actúa como proxy server-side hacia el
 * worker del bot. Inyecta el Bearer token desde un secret de Cloudflare,
 * así el bundle del browser nunca contiene credenciales.
 *
 * Bindings esperados (definidos en wrangler.toml):
 *   - ASSETS:            fetcher de los assets estáticos (dist/)
 *   - BOT_API_BASE:      var pública, URL del worker del bot (sin slash final)
 *   - API_SHARED_TOKEN:  secret, debe coincidir con el del bot worker
 */

interface Env {
  ASSETS: Fetcher;
  BOT_API_BASE: string;
  API_SHARED_TOKEN: string;
}

// Headers que no tiene sentido reenviar upstream — los regenera Cloudflare
// o son específicos del request entrante.
const STRIP_HEADERS = ['host', 'cf-connecting-ip', 'cf-ray', 'cf-visitor', 'x-forwarded-for'];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return proxyToBot(request, url, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function proxyToBot(request: Request, url: URL, env: Env): Promise<Response> {
  if (!env.API_SHARED_TOKEN) {
    return jsonError(500, 'config_error', 'API_SHARED_TOKEN no está configurado en el worker.');
  }
  if (!env.BOT_API_BASE) {
    return jsonError(500, 'config_error', 'BOT_API_BASE no está configurado en el worker.');
  }

  const upstream = `${env.BOT_API_BASE.replace(/\/$/, '')}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  for (const h of STRIP_HEADERS) headers.delete(h);
  headers.set('Authorization', `Bearer ${env.API_SHARED_TOKEN}`);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  return fetch(upstream, init);
}

function jsonError(status: number, code: string, message: string): Response {
  return new Response(
    JSON.stringify({ ok: false, data: null, error: { code, message } }),
    { status, headers: { 'Content-Type': 'application/json' } },
  );
}
