import { describe, expect, test } from 'vitest';

import { localDate, localDateTimeToUtc, todayInTz } from '../src/utils/time.js';

describe('localDateTimeToUtc', () => {
  test('Lima esta en UTC-5 sin DST', () => {
    const utc = localDateTimeToUtc('2026-06-01 09:00', 'America/Lima');
    expect(utc.toISOString()).toBe('2026-06-01T14:00:00.000Z');
  });

  test('UTC mismo significa identidad', () => {
    const utc = localDateTimeToUtc('2026-06-01 09:00', 'UTC');
    expect(utc.toISOString()).toBe('2026-06-01T09:00:00.000Z');
  });

  test('Buenos Aires UTC-3', () => {
    const utc = localDateTimeToUtc('2026-06-01 09:00', 'America/Buenos_Aires');
    expect(utc.toISOString()).toBe('2026-06-01T12:00:00.000Z');
  });

  test('acepta formato con T (ISO sin offset)', () => {
    const utc = localDateTimeToUtc('2026-06-01T09:00', 'America/Lima');
    expect(utc.toISOString()).toBe('2026-06-01T14:00:00.000Z');
  });

  test('media noche local', () => {
    const utc = localDateTimeToUtc('2026-06-01 00:00', 'America/Lima');
    expect(utc.toISOString()).toBe('2026-06-01T05:00:00.000Z');
  });
});

describe('localDate', () => {
  test('formatea YYYY-MM-DD en la TZ pedida', () => {
    // 2026-06-01T02:00:00Z es 2026-05-31 21:00 en Lima (UTC-5)
    const d = new Date('2026-06-01T02:00:00Z');
    expect(localDate(d, 'America/Lima')).toBe('2026-05-31');
    expect(localDate(d, 'UTC')).toBe('2026-06-01');
  });
});

describe('todayInTz', () => {
  test('devuelve un string YYYY-MM-DD', () => {
    expect(todayInTz('America/Lima')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
