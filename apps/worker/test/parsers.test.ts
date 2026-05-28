import { describe, expect, test } from 'vitest';

import { parseExpenseCommand, parseExpensesQuery } from '../src/parsers/expense.js';
import { parseReminderCommand } from '../src/parsers/reminder.js';
import { isUrl, parseWatchCommand } from '../src/parsers/watch.js';

describe('parseExpenseCommand', () => {
  test('PEN por defecto sin moneda explicita', () => {
    expect(parseExpenseCommand('/gasto 50 cafe desayuno')).toEqual({
      amount: 50,
      currency: 'PEN',
      category: 'cafe',
      description: 'desayuno',
    });
  });

  test('decimales en el monto', () => {
    const r = parseExpenseCommand('/gasto 18.50 comida menu del dia');
    expect(r?.amount).toBe(18.5);
    expect(r?.currency).toBe('PEN');
  });

  test('USD con sufijo "usd"', () => {
    expect(parseExpenseCommand('/gasto 30 usd transporte uber al aeropuerto')).toEqual({
      amount: 30,
      currency: 'USD',
      category: 'transporte',
      description: 'uber al aeropuerto',
    });
  });

  test('USD con prefijo $', () => {
    expect(parseExpenseCommand('/gasto $30 transporte uber')).toEqual({
      amount: 30,
      currency: 'USD',
      category: 'transporte',
      description: 'uber',
    });
  });

  test('USD con "dolares" (sin tilde)', () => {
    const r = parseExpenseCommand('/gasto 15 dolares ocio cine');
    expect(r?.currency).toBe('USD');
    expect(r?.amount).toBe(15);
  });

  test('USD con "dólares" (con tilde)', () => {
    const r = parseExpenseCommand('/gasto 15 dólares ocio cine');
    expect(r?.currency).toBe('USD');
  });

  test('sin descripcion produce description vacio', () => {
    expect(parseExpenseCommand('/gasto 20 comida')).toEqual({
      amount: 20,
      currency: 'PEN',
      category: 'comida',
      description: '',
    });
  });

  test('categoria queda en minusculas', () => {
    const r = parseExpenseCommand('/gasto 10 COMIDA pan');
    expect(r?.category).toBe('comida');
  });

  test('comando invalido devuelve null', () => {
    expect(parseExpenseCommand('hola mundo')).toBeNull();
    expect(parseExpenseCommand('/gasto')).toBeNull();
    expect(parseExpenseCommand('/gasto abc def')).toBeNull();
  });
});

describe('parseExpensesQuery', () => {
  test('/gastos hoy', () => {
    expect(parseExpensesQuery('/gastos hoy')).toEqual({ kind: 'list', period: 'day' });
  });

  test('/gastos sin sufijo = hoy', () => {
    expect(parseExpensesQuery('/gastos')).toEqual({ kind: 'list', period: 'day' });
  });

  test('/gastos semana', () => {
    expect(parseExpensesQuery('/gastos semana')).toEqual({ kind: 'list', period: 'week' });
  });

  test('/gastos mes', () => {
    expect(parseExpensesQuery('/gastos mes')).toEqual({ kind: 'list', period: 'month' });
  });

  test('/gastos borrar 42', () => {
    expect(parseExpensesQuery('/gastos borrar 42')).toEqual({ kind: 'delete', id: 42 });
  });

  test('comando invalido devuelve null', () => {
    expect(parseExpensesQuery('/gastos xxx')).toBeNull();
  });
});

describe('parseReminderCommand', () => {
  test('crear con fecha + hora', () => {
    expect(parseReminderCommand('/recordar 2026-06-01 09:00 pagar luz')).toEqual({
      kind: 'create',
      fireAtLocal: '2026-06-01 09:00',
      text: 'pagar luz',
    });
  });

  test('hora con un solo digito se normaliza a HH:mm', () => {
    const r = parseReminderCommand('/recordar 2026-06-01 9:00 pagar luz');
    expect(r?.kind).toBe('create');
    if (r?.kind === 'create') expect(r.fireAtLocal).toBe('2026-06-01 09:00');
  });

  test('/recordatorios lista', () => {
    expect(parseReminderCommand('/recordatorios')).toEqual({ kind: 'list' });
  });

  test('borrar', () => {
    expect(parseReminderCommand('/recordar borrar 7')).toEqual({ kind: 'delete', id: 7 });
  });

  test('texto sin fecha valida devuelve null', () => {
    expect(parseReminderCommand('/recordar manana 9am pagar luz')).toBeNull();
  });

  test('comando ajeno devuelve null', () => {
    expect(parseReminderCommand('/gasto 10 cafe')).toBeNull();
  });
});

describe('parseWatchCommand', () => {
  test('lista vacia y "lista"', () => {
    expect(parseWatchCommand('/ver')).toEqual({ kind: 'list' });
    expect(parseWatchCommand('/ver lista')).toEqual({ kind: 'list' });
  });

  test('marcar visto', () => {
    expect(parseWatchCommand('/ver visto 12')).toEqual({ kind: 'mark_watched', id: 12 });
  });

  test('borrar', () => {
    expect(parseWatchCommand('/ver borrar 3')).toEqual({ kind: 'delete', id: 3 });
  });

  test('crear con alias en espanol', () => {
    expect(parseWatchCommand('/ver pelicula Dune Parte Dos')).toEqual({
      kind: 'create',
      itemKind: 'movie',
      title: 'Dune Parte Dos',
    });
    expect(parseWatchCommand('/ver peli Oppenheimer')).toEqual({
      kind: 'create',
      itemKind: 'movie',
      title: 'Oppenheimer',
    });
    expect(parseWatchCommand('/ver serie The Last of Us')).toEqual({
      kind: 'create',
      itemKind: 'series',
      title: 'The Last of Us',
    });
    expect(parseWatchCommand('/ver tt Receta de lomo saltado')).toEqual({
      kind: 'create',
      itemKind: 'tiktok',
      title: 'Receta de lomo saltado',
    });
  });

  test('kind desconocido devuelve null', () => {
    expect(parseWatchCommand('/ver libro El Quijote')).toBeNull();
  });
});

describe('isUrl', () => {
  test('detecta URLs http/https', () => {
    expect(isUrl('https://www.tiktok.com/@cocinaperu/video/123')).toBe(true);
    expect(isUrl('http://example.com')).toBe(true);
  });

  test('no detecta texto comun', () => {
    expect(isUrl('hola mundo')).toBe(false);
    expect(isUrl('www.example.com')).toBe(false);
  });
});
