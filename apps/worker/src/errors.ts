import { API_ERROR_CODES, type ApiErrorCode } from '@alice/shared';

/** Clase base para errores del dominio que se mapean a respuestas HTTP. */
export class AppError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(API_ERROR_CODES.validation, message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'No encontrado') {
    super(API_ERROR_CODES.notFound, message, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(API_ERROR_CODES.unauthorized, message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit excedido') {
    super(API_ERROR_CODES.rateLimit, message, 429);
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, details?: unknown) {
    super(API_ERROR_CODES.external, message, 502, details);
    this.name = 'ExternalServiceError';
  }
}
