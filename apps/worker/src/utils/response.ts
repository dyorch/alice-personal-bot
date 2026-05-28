import { API_ERROR_CODES, type ApiErrorCode } from '@alice/shared';

/** Construye la envolvente `{ ok: true, data, error: null }`. */
export function ok<T>(data: T) {
  return { ok: true as const, data, error: null };
}

/** Construye la envolvente `{ ok: false, data: null, error: {...} }`. */
export function fail(code: ApiErrorCode | string, message: string, details?: unknown) {
  return {
    ok: false as const,
    data: null,
    error: { code, message, ...(details === undefined ? {} : { details }) },
  };
}

export { API_ERROR_CODES };
