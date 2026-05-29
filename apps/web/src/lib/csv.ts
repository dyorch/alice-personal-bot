/** Escapa un campo CSV según RFC 4180. */
export function escapeCsvField(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Construye CSV a partir de headers y filas. Usa CRLF como separador de líneas (RFC 4180). */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const headerLine = headers.map(escapeCsvField).join(',');
  const lines = rows.map((row) => row.map(escapeCsvField).join(','));
  return [headerLine, ...lines].join('\r\n');
}
