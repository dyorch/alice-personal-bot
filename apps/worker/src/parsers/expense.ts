import type { Currency } from '@alice/shared';

export interface ParsedExpense {
  amount: number;
  currency: Currency;
  category: string;
  description: string;
}

/**
 * Parsea `/gasto <monto> [usd|$|dolares|dólares] <categoria> <descripcion>`.
 * Soporta:
 *   /gasto 50 cafe desayuno
 *   /gasto 30 usd transporte uber
 *   /gasto $30 transporte uber al aeropuerto
 *   /gasto 12.50 dolares ocio cine
 */
export function parseExpenseCommand(text: string): ParsedExpense | null {
  const m = text.trim().match(/^\/gasto\s+(.+)$/i);
  if (!m) return null;
  const rest = m[1]!.trim();

  const dollarPrefix = rest.match(/^\$\s*(\d+(?:\.\d+)?)\s+(\S+)(?:\s+(.*))?$/);
  if (dollarPrefix) {
    return build(dollarPrefix[1]!, 'USD', dollarPrefix[2]!, dollarPrefix[3]);
  }

  const usdAfter = rest.match(
    /^(\d+(?:\.\d+)?)\s+(?:usd|dolares|dólares|\$)\s+(\S+)(?:\s+(.*))?$/i,
  );
  if (usdAfter) {
    return build(usdAfter[1]!, 'USD', usdAfter[2]!, usdAfter[3]);
  }

  const plain = rest.match(/^(\d+(?:\.\d+)?)\s+(\S+)(?:\s+(.*))?$/);
  if (plain) {
    return build(plain[1]!, 'PEN', plain[2]!, plain[3]);
  }

  return null;
}

function build(amt: string, currency: Currency, category: string, desc?: string): ParsedExpense {
  return {
    amount: Number(amt),
    currency,
    category: category.toLowerCase(),
    description: (desc ?? '').trim(),
  };
}

export type ExpensesQuery =
  | { kind: 'list'; period: 'today' | 'week' | 'month' }
  | { kind: 'delete'; id: number };

/** Parsea `/gastos`, `/gastos hoy|semana|mes`, `/gastos borrar <id>`. */
export function parseExpensesQuery(text: string): ExpensesQuery | null {
  const m = text.trim().match(/^\/gastos\s*(.*)$/i);
  if (!m) return null;
  const rest = m[1]!.trim().toLowerCase();
  if (!rest || rest === 'hoy') return { kind: 'list', period: 'today' };
  if (rest === 'semana') return { kind: 'list', period: 'week' };
  if (rest === 'mes') return { kind: 'list', period: 'month' };
  const del = rest.match(/^borrar\s+(\d+)$/);
  if (del) return { kind: 'delete', id: Number(del[1]) };
  return null;
}
