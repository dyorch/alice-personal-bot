import { describe, expect, it } from 'vitest';

import { dateKey, presetRange, previousMonthKey } from './date-utils';

describe('dateKey', () => {
  it('formatea con padding de mes y día', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(dateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('previousMonthKey', () => {
  it('retrocede un mes en el mismo año', () => {
    expect(previousMonthKey('2026-05')).toBe('2026-04');
  });

  it('cruza año al ir de enero a diciembre', () => {
    expect(previousMonthKey('2026-01')).toBe('2025-12');
  });
});

describe('presetRange', () => {
  it('today devuelve hoy en ambos extremos', () => {
    const now = new Date(2026, 4, 15);
    const r = presetRange('today', now, undefined);
    expect(r).toEqual({ from: '2026-05-15', to: '2026-05-15' });
  });

  it('month devuelve primer y último día del mes', () => {
    const now = new Date(2026, 4, 15);
    const r = presetRange('month', now, undefined);
    expect(r).toEqual({ from: '2026-05-01', to: '2026-05-31' });
  });

  it('prevMonth maneja febrero correctamente', () => {
    const now = new Date(2026, 2, 10); // marzo
    const r = presetRange('prevMonth', now, undefined);
    expect(r).toEqual({ from: '2026-02-01', to: '2026-02-28' });
  });

  it('week (miércoles) devuelve de lunes a domingo', () => {
    const wednesday = new Date(2026, 4, 13); // miércoles 13 mayo 2026
    const r = presetRange('week', wednesday, undefined);
    expect(r).toEqual({ from: '2026-05-11', to: '2026-05-17' });
  });

  it('all devuelve null en ambos extremos', () => {
    const r = presetRange('all', new Date(), undefined);
    expect(r).toEqual({ from: null, to: null });
  });

  it('custom usa el rango pasado', () => {
    const r = presetRange('custom', new Date(), {
      from: new Date(2026, 0, 1),
      to: new Date(2026, 0, 31),
    });
    expect(r).toEqual({ from: '2026-01-01', to: '2026-01-31' });
  });
});
