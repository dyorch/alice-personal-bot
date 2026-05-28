/**
 * Verificacion de `X-Hub-Signature-256` que Meta envia con cada webhook.
 * Se computa HMAC-SHA256 sobre el body crudo usando `WHATSAPP_APP_SECRET`.
 */

function hexFromBytes(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let out = '';
  for (let i = 0; i < view.length; i++) {
    out += view[i]!.toString(16).padStart(2, '0');
  }
  return out;
}

/** Comparacion byte a byte en tiempo constante para evitar timing attacks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifySignature(
  rawBody: string,
  header: string | null | undefined,
  appSecret: string,
): Promise<boolean> {
  if (!header || !header.startsWith('sha256=')) return false;
  const expected = header.slice('sha256='.length);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  return timingSafeEqual(hexFromBytes(sig), expected);
}
