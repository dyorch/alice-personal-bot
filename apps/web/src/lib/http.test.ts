import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, http, qs } from './http';

describe('qs', () => {
  it('descarta undefined, null y string vacío', () => {
    expect(qs({ a: 1, b: undefined, c: null, d: '' })).toBe('?a=1');
  });

  it('encodea los valores', () => {
    expect(qs({ q: 'hola mundo' })).toBe('?q=hola%20mundo');
  });

  it('devuelve string vacío si no hay params', () => {
    expect(qs({})).toBe('');
    expect(qs({ a: undefined })).toBe('');
  });
});

describe('http', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parsea envelope ok y devuelve data', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ ok: true, data: { id: 42 }, error: null }),
    });
    const result = await http<{ id: number }>('/api/test');
    expect(result).toEqual({ id: 42 });
  });

  it('lanza ApiError con code y status cuando el envelope es error', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 422,
      json: async () => ({
        ok: false,
        data: null,
        error: { code: 'validation_failed', message: 'Monto inválido' },
      }),
    });
    await expect(http('/api/test')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'validation_failed',
      message: 'Monto inválido',
      status: 422,
    });
  });

  it('lanza ApiError cuando la respuesta no es JSON', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 500,
      json: async () => {
        throw new Error('boom');
      },
    });
    await expect(http('/api/test')).rejects.toBeInstanceOf(ApiError);
  });

  it('añade Content-Type application/json en POST con body, sin Authorization', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ ok: true, data: {}, error: null }),
    });
    await http('/api/test', { method: 'POST', body: JSON.stringify({ x: 1 }) });
    const headers = fetchMock.mock.calls[0]![1].headers;
    expect(headers['Content-Type']).toBe('application/json');
    // El cliente NO inyecta Authorization. Lo hace el proxy server-side
    // (worker en prod, vite proxy en dev) — el token nunca toca el bundle.
    expect(headers.Authorization).toBeUndefined();
  });

  it('llama con path relativo (mismo origen) sin prefijo de base URL', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ ok: true, data: null, error: null }),
    });
    await http('/api/expenses?limit=10');
    expect(fetchMock.mock.calls[0]![0]).toBe('/api/expenses?limit=10');
  });
});
