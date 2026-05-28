import { z } from 'zod';

/** Forma standard de toda respuesta de la API REST del worker. */
export const ApiError = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiError>;

export const ApiResponse = <T extends z.ZodTypeAny>(data: T) =>
  z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), data, error: z.null() }),
    z.object({ ok: z.literal(false), data: z.null(), error: ApiError }),
  ]);

/** Codigos de error tipados que viajan en `error.code`. */
export const API_ERROR_CODES = {
  validation: 'VALIDATION_ERROR',
  notFound: 'NOT_FOUND',
  unauthorized: 'UNAUTHORIZED',
  rateLimit: 'RATE_LIMITED',
  external: 'EXTERNAL_SERVICE_ERROR',
  internal: 'INTERNAL_ERROR',
} as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
