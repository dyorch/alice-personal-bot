import { describe, expect, test } from 'vitest';

import { verifySignature } from '../src/security/signature.js';

const SECRET = 'test_secret_value_123';

async function hmacHex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

describe('verifySignature', () => {
  test('acepta firma valida con prefijo sha256=', async () => {
    const body = '{"hello":"world"}';
    const sig = `sha256=${await hmacHex(SECRET, body)}`;
    expect(await verifySignature(body, sig, SECRET)).toBe(true);
  });

  test('rechaza firma sin prefijo sha256=', async () => {
    const body = '{"hello":"world"}';
    const sig = await hmacHex(SECRET, body);
    expect(await verifySignature(body, sig, SECRET)).toBe(false);
  });

  test('rechaza firma incorrecta', async () => {
    const body = '{"hello":"world"}';
    const sig = `sha256=${await hmacHex('otro_secret', body)}`;
    expect(await verifySignature(body, sig, SECRET)).toBe(false);
  });

  test('rechaza si el body cambia un caracter', async () => {
    const body = '{"hello":"world"}';
    const sig = `sha256=${await hmacHex(SECRET, body)}`;
    expect(await verifySignature(`${body} `, sig, SECRET)).toBe(false);
  });

  test('rechaza header vacio o nulo', async () => {
    expect(await verifySignature('x', null, SECRET)).toBe(false);
    expect(await verifySignature('x', '', SECRET)).toBe(false);
    expect(await verifySignature('x', undefined, SECRET)).toBe(false);
  });
});
